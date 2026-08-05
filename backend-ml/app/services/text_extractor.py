# app/services/text_extractor.py
"""
Giai đoạn [1]-[2] của pipeline parser: đọc file -> text thô -> chuẩn hóa.
Tách riêng module này để Giai đoạn sau (thêm OCR cho PDF scan) không
đụng vào logic parser_service.py.
"""
from __future__ import annotations

import io
import unicodedata

import pdfplumber
from docx import Document


class UnsupportedFileTypeError(Exception):
    pass


def extract_text(file_bytes: bytes, filename: str) -> tuple[str, list[str]]:
    """
    Trả về (text, warnings).
    warnings chứa các cảnh báo dạng "trang X không có text" để
    parser_service quyết định có cần OCR fallback không (Giai đoạn sau).
    """
    warnings: list[str] = []
    ext = filename.lower().rsplit(".", 1)[-1] if "." in filename else ""

    if ext == "pdf":
        text = _extract_pdf(file_bytes, warnings)
    elif ext in ("docx",):
        text = _extract_docx(file_bytes)
    elif ext == "doc":
        raise UnsupportedFileTypeError(
            "File .doc (Word 97-2003) chưa được hỗ trợ, chỉ nhận .docx và .pdf"
        )
    else:
        raise UnsupportedFileTypeError(f"Định dạng file không được hỗ trợ: .{ext}")

    return _normalize(text), warnings


def _extract_pdf(file_bytes: bytes, warnings: list[str]) -> str:
    chunks: list[str] = []
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for i, page in enumerate(pdf.pages):
            page_text = page.extract_text() or ""
            if not page_text.strip():
                warnings.append(
                    f"Trang {i + 1} không trích xuất được text — "
                    f"có thể là PDF scan (ảnh), cần OCR."
                )
            chunks.append(page_text)
    return "\n".join(chunks)


def _extract_docx(file_bytes: bytes) -> str:
    doc = Document(io.BytesIO(file_bytes))
    parts = [p.text for p in doc.paragraphs]
    # Nhiều CV dùng table để layout 2 cột -> phải quét cả table
    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                if cell.text.strip():
                    parts.append(cell.text)
    return "\n".join(parts)


def _normalize(text: str) -> str:
    # Chuẩn hóa unicode tiếng Việt về dạng NFC (tránh lỗi dấu bị tách rời)
    text = unicodedata.normalize("NFC", text)
    # Gom nhiều dòng trống liên tiếp
    lines = [line.rstrip() for line in text.splitlines()]
    cleaned = "\n".join(line for line in lines if line.strip() != "" or True)
    return cleaned.strip()