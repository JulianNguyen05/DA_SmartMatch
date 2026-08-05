# app/services/parser_service.py
"""
Điều phối toàn bộ pipeline:
  [1] extract text -> [2] preprocess -> [3] split sections
  -> [4] rule-based extraction -> [5] response

NER model (Giai đoạn 3) sẽ được chèn vào giữa bước [3] và [5] sau này,
với rule-based là fallback khi NER confidence thấp — không thay thế
hoàn toàn module này.
"""
from __future__ import annotations

from app.schemas.parser_schema import ParsedCvResponse
from app.services import rule_based_extractor as rbe
from app.services.text_extractor import UnsupportedFileTypeError, extract_text


class ParserService:
    def __init__(self, skill_catalog_provider):
        """
        skill_catalog_provider: callable không tham số, trả về
        dict {skill_name_lowercase: skill_id}, lấy từ reference_values
        bên backend-core. Truyền vào dạng provider (không phải dict tĩnh)
        để luôn lấy catalog mới nhất mà không cần restart service.
        """
        self._skill_catalog_provider = skill_catalog_provider

    def parse(self, file_bytes: bytes, filename: str) -> ParsedCvResponse:
        text, warnings = extract_text(file_bytes, filename)

        if not text.strip():
            return ParsedCvResponse(
                raw_text="",
                contact=rbe.ContactInfo(),
                warnings=warnings
                + ["Không trích xuất được nội dung text nào từ file."],
            )

        contact = rbe.extract_contact(text)
        sections = rbe.split_sections(text)

        skills_block = sections.get("skills", "")
        education_block = sections.get("education", "")
        experience_block = sections.get("experience", "")
        summary_block = sections.get("summary")

        skill_catalog = self._skill_catalog_provider()

        if not sections:
            warnings.append(
                "Không nhận diện được heading section nào (Học vấn/Kinh nghiệm/"
                "Kỹ năng) — CV có thể dùng format không chuẩn. Kết quả trích "
                "xuất sẽ hạn chế, cần người dùng nhập tay bổ sung."
            )

        return ParsedCvResponse(
            raw_text=text,
            contact=contact,
            educations=rbe.extract_educations(education_block),
            experiences=rbe.extract_experiences(experience_block),
            skills=rbe.extract_skills(skills_block, skill_catalog),
            summary_text=summary_block,
            warnings=warnings,
        )


def parse_cv(file_bytes: bytes, filename: str, skill_catalog: dict[str, int]) -> ParsedCvResponse:
    """Hàm tiện ích cho việc test nhanh, không qua DI của FastAPI."""
    service = ParserService(skill_catalog_provider=lambda: skill_catalog)
    return service.parse(file_bytes, filename)