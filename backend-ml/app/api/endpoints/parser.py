# app/api/endpoints/parser.py
from __future__ import annotations

import logging

import httpx
from fastapi import APIRouter, HTTPException, UploadFile, status

from app.core.config import settings
from app.core.ttl_cache import TTLCache
from app.schemas.parser_schema import ParsedCvResponse
from app.services.parser_service import ParserService
from app.services.text_extractor import UnsupportedFileTypeError

logger = logging.getLogger("worklify.parser")

router = APIRouter(prefix="/parser", tags=["parser"])

_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10MB
_ALLOWED_CONTENT_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png",
}

# 5 phút: đủ ngắn để skill mới thêm/duyệt (qua ReferenceValueSuggestion) sớm có
# hiệu lực, đủ dài để không spam backend-core mỗi lần có người upload CV.
_SKILL_CATALOG_TTL_SECONDS = 5 * 60


def _fetch_skill_catalog_from_backend() -> dict[str, int]:
    """
    Gọi endpoint nội bộ /api/internal/reference-values (permitAll + API key riêng,
    xem InternalReferenceValueController bên backend-core) để lấy toàn bộ skill
    trong reference_values, dùng cho dictionary matching.

    Response ApiResponse<List<ReferenceValueResponse>> có field "name" (không phải
    "value") — khớp với cột reference_values.name trong DB.

    Cố ý KHÔNG catch lỗi ở đây — để lỗi propagate lên TTLCache, tránh cache lại
    kết quả rỗng {} khi backend-core chỉ đang down tạm thời (xem _get_skill_catalog).
    """
    resp = httpx.get(
        f"{settings.BACKEND_CORE_URL}/api/internal/reference-values",
        params={"type": "SKILL"},
        headers={"X-Internal-Api-Key": settings.INTERNAL_API_KEY},
        timeout=5.0,
    )
    resp.raise_for_status()
    items = resp.json()["data"]
    return {item["name"].strip().lower(): item["id"] for item in items}


_skill_catalog_cache: TTLCache[dict[str, int]] = TTLCache(
    loader=_fetch_skill_catalog_from_backend,
    ttl_seconds=_SKILL_CATALOG_TTL_SECONDS,
)


def _get_skill_catalog() -> dict[str, int]:
    """
    Wrapper dùng làm skill_catalog_provider cho ParserService.
    Bắt lỗi ở ĐÂY (không phải trong loader) để lần gọi thất bại không bị cache lại
    — request tiếp theo sẽ tự retry gọi backend-core thay vì chờ hết TTL.
    """
    try:
        return _skill_catalog_cache.get()
    except httpx.HTTPError:
        logger.warning(
            "Không gọi được backend-core để lấy skill catalog, "
            "tạm thời bỏ qua skill_id matching cho request này."
        )
        return {}


_service = ParserService(skill_catalog_provider=_get_skill_catalog)


@router.post("/extract", response_model=ParsedCvResponse)
async def extract_cv(file: UploadFile):
    if file.content_type not in _ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Chỉ chấp nhận file .pdf, .docx, .jpg hoặc .png",
        )

    file_bytes = await file.read()
    if len(file_bytes) > _MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File vượt quá giới hạn 10MB",
        )

    try:
        return _service.parse(file_bytes, file.filename or "upload")
    except UnsupportedFileTypeError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))