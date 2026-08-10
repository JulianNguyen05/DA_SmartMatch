# app/services/ner_postprocessor.py
"""
Model NER trả về từng entity RỜI RẠC (vd 1 span "Degree", 1 span "College
Name", 1 span "Graduation Year" — không biết chúng có cùng thuộc 1 mục học
vấn hay không). Module này gom lại thành từng "mục" (EducationItem,
ExperienceItem) bằng heuristic vị trí: các entity nằm gần nhau trong text
(cùng 1 đoạn CV) nhiều khả năng thuộc cùng 1 mục.

CHỦ Ý: KHÔNG dùng cho Skills — xem quyết định trong parser_service.py
(F1 Skills = 0.03 trên tập test, quá thấp để tin cậy, giữ dictionary
matching cũ thay vì NER cho field này).
"""
from __future__ import annotations

from app.models.model_loader import EntitySpan
from app.schemas.parser_schema import EducationItem, ExperienceItem, ExtractedField, ExtractionSource

# Khoảng cách ký tự tối đa giữa 2 entity liên tiếp để coi là CÙNG 1 mục.
# Vượt quá ngưỡng này -> coi như đã sang mục học vấn/kinh nghiệm khác.
# Giá trị chọn theo quan sát: 1 mục education/experience điển hình dài
# khoảng 50-150 ký tự (school + degree + năm nằm gần nhau trong CV thật).
_GROUP_GAP_THRESHOLD = 200

_EDUCATION_TYPES = {"Degree", "College Name", "Graduation Year"}
_EXPERIENCE_TYPES = {"Designation", "Companies worked at"}


def _to_field(span: EntitySpan | None) -> ExtractedField | None:
    if span is None:
        return None
    return ExtractedField(
        value=span["text"],
        confidence=span["confidence"],
        source=ExtractionSource.NER_MODEL,
    )


def group_into_items(
    spans: list[EntitySpan], group_types: set[str], gap_threshold: int = _GROUP_GAP_THRESHOLD
) -> list[dict[str, EntitySpan]]:
    """
    Gom các entity có label trong group_types thành từng nhóm (item).
    Bắt đầu 1 item mới khi:
      - khoảng cách tới entity trước đó > gap_threshold ký tự, HOẶC
      - label bị lặp lại trong item hiện tại (vd gặp "Degree" thứ 2 khi
        item đang có sẵn 1 "Degree" -> chắc chắn đã sang mục học vấn khác,
        vì 1 người không có 2 bằng trong cùng 1 mục).

    spans PHẢI đã sort theo "start" từ trước (model_loader.predict_entities
    đã đảm bảo điều này).
    """
    relevant = [s for s in spans if s["label"] in group_types]

    items: list[dict[str, EntitySpan]] = []
    current: dict[str, EntitySpan] = {}
    prev_end: int | None = None

    for span in relevant:
        starts_new = (
            prev_end is None
            or (span["start"] - prev_end) > gap_threshold
            or span["label"] in current
        )
        if starts_new and current:
            items.append(current)
            current = {}

        current[span["label"]] = span
        prev_end = span["end"]

    if current:
        items.append(current)

    return items


def build_education_items(spans: list[EntitySpan]) -> list[EducationItem]:
    groups = group_into_items(spans, _EDUCATION_TYPES)
    items = []
    for g in groups:
        raw_text = " | ".join(s["text"].strip() for s in g.values())
        items.append(
            EducationItem(
                school=_to_field(g.get("College Name")),
                degree=_to_field(g.get("Degree")),
                start_date=None,  # dataset gốc không có nhãn riêng ngày bắt đầu học
                end_date=_to_field(g.get("Graduation Year")),
                raw_text=raw_text,
            )
        )
    return items


def build_experience_items(spans: list[EntitySpan]) -> list[ExperienceItem]:
    groups = group_into_items(spans, _EXPERIENCE_TYPES)
    items = []
    for g in groups:
        raw_text = " | ".join(s["text"].strip() for s in g.values())
        items.append(
            ExperienceItem(
                job_title=_to_field(g.get("Designation")),
                company=_to_field(g.get("Companies worked at")),
                start_date=None,
                end_date=None,
                raw_text=raw_text,
            )
        )
    return items


def pick_best_single(spans: list[EntitySpan], label: str) -> ExtractedField | None:
    """
    Dùng cho entity chỉ nên xuất hiện 1 lần trong CV (Name, Location) —
    lấy entity có confidence cao nhất nếu model tìm thấy nhiều hơn 1.
    """
    candidates = [s for s in spans if s["label"] == label]
    if not candidates:
        return None
    best = max(candidates, key=lambda s: s["confidence"])
    return _to_field(best)