# app/services/parser_service.py
"""
Điều phối toàn bộ pipeline:
  [1] extract text -> [2] preprocess -> [3] split sections (rule-based)
  -> [4] NER (nếu model có sẵn) + rule-based -> [5] response

Quyết định kiến trúc quan trọng (dựa trên F1 thực đo trên tập test sau khi
fine-tune, xem ml_training/train_ner.py):
  - Educations/Experiences/Name/Location: ƯU TIÊN NER khi có model
    (F1 Name=0.82, Location=0.65, Designation=0.41, Degree=0.37 — đủ dùng
    làm gợi ý auto-fill có confidence, không phải tuyệt đối chính xác).
  - Skills: LUÔN dùng dictionary matching (rule_based_extractor), KHÔNG
    dùng NER — F1 Skills chỉ 0.03 trên tập test, gần như vô dụng, có thể
    do nhãn "Skills" trong dataset gốc là block text dài không đồng nhất.
  - Nếu model NER chưa có sẵn (is_available=False): fallback về 100%
    rule-based như Giai đoạn 1, không lỗi, không thiếu response.
"""
from __future__ import annotations

from app.models.model_loader import get_ner_model
from app.schemas.parser_schema import ParsedCvResponse
from app.services import ner_postprocessor as nerp
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

        ner_model = get_ner_model()
        full_name = None
        location = None

        if ner_model.is_available:
            ner_spans = ner_model.predict_entities(text)
            educations = nerp.build_education_items(ner_spans)
            experiences = nerp.build_experience_items(ner_spans)
            full_name = nerp.pick_best_single(ner_spans, "Name")
            location = nerp.pick_best_single(ner_spans, "Location")

            # NER không tìm thấy mục nào (vd CV format quá lạ) -> fallback
            # về rule-based cho riêng phần đó thay vì trả về rỗng
            if not educations:
                educations = rbe.extract_educations(education_block)
            if not experiences:
                experiences = rbe.extract_experiences(experience_block)
        else:
            warnings.append(
                "Model NER chưa sẵn sàng, dùng rule-based extraction cho "
                "học vấn/kinh nghiệm (độ chính xác hạn chế hơn)."
            )
            educations = rbe.extract_educations(education_block)
            experiences = rbe.extract_experiences(experience_block)

        return ParsedCvResponse(
            raw_text=text,
            contact=contact,
            full_name=full_name,
            location=location,
            educations=educations,
            experiences=experiences,
            # Skills LUÔN dùng dictionary matching, không dùng NER — xem
            # docstring đầu file.
            skills=rbe.extract_skills(skills_block, skill_catalog),
            summary_text=summary_block,
            warnings=warnings,
        )


def parse_cv(file_bytes: bytes, filename: str, skill_catalog: dict[str, int]) -> ParsedCvResponse:
    """Hàm tiện ích cho việc test nhanh, không qua DI của FastAPI."""
    service = ParserService(skill_catalog_provider=lambda: skill_catalog)
    return service.parse(file_bytes, filename)