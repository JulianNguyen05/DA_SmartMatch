# app/api/endpoints/parser.py
from __future__ import annotations

import httpx
from fastapi import APIRouter, HTTPException, UploadFile, status

from app.core.config import settings
from app.schemas.parser_schema import ParsedCvResponse
from app.services.parser_service import ParserService
from app.services.text_extractor import UnsupportedFileTypeError

router = APIRouter(prefix="/parser", tags=["parser"])

_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10MB
_ALLOWED_CONTENT_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}


def _fetch_skill_catalog() -> dict[str, int]:
    """
    Gọi ngược sang backend-core để lấy danh sách skill hiện có trong
    reference_values, dùng cho dictionary matching. Có cache đơn giản
    ở tầng gọi (xem NOTE bên dưới) để tránh gọi lại mỗi request.
    """
    try:
        resp = httpx.get(f"{settings.BACKEND_CORE_URL}/api/reference-values/skills", timeout=5.0)
        resp.raise_for_status()
        data = resp.json()
        return {item["value"].strip().lower(): item["id"] for item in data}
    except httpx.HTTPError:
        # Không chặn parser chạy nếu backend-core tạm thời không tới được —
        # chỉ mất phần match skill_id, các field khác vẫn trích xuất bình thường
        return {}


_service = ParserService(skill_catalog_provider=_fetch_skill_catalog)


@router.post("/extract", response_model=ParsedCvResponse)
async def extract_cv(file: UploadFile):
    if file.content_type not in _ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Chỉ chấp nhận file .pdf hoặc .docx",
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