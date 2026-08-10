# app/services/rule_based_extractor.py
"""
Giai đoạn [4] của pipeline (baseline không dùng ML) + [5] post-processing.

Đây là baseline "chạy được ngay" — dùng để:
  1. Có API hoạt động thật trong lúc chờ dataset gán nhãn cho NER (Giai đoạn 2-3)
  2. Làm fallback khi model NER không tự tin (post Giai đoạn 4)
  3. Pre-label dữ liệu cho Label Studio, giảm công gán nhãn tay
"""
from __future__ import annotations

import re

from app.schemas.parser_schema import (
    ContactInfo,
    EducationItem,
    ExperienceItem,
    ExtractedField,
    SkillItem,
)

# ---------------------------------------------------------------------------
# Regex patterns cho các field có cấu trúc rõ ràng (không cần ML)
# ---------------------------------------------------------------------------

_EMAIL_RE = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")

# Số VN: 0xxxxxxxxx hoặc +84xxxxxxxxx, cho phép khoảng trắng/dấu chấm phân tách
_PHONE_RE = re.compile(r"(?:\+84|0)(?:[\s.-]?\d){9,10}")

_LINKEDIN_RE = re.compile(r"(?:https?://)?(?:www\.)?linkedin\.com/in/[\w-]+/?", re.I)
_GITHUB_RE = re.compile(r"(?:https?://)?(?:www\.)?github\.com/[\w-]+/?", re.I)
_WEBSITE_RE = re.compile(
    r"(?:https?://)?(?:www\.)?[\w-]+\.[a-z]{2,}(?:/[\w./-]*)?", re.I
)

# Heading phổ biến trong CV tiếng Anh (không phân biệt hoa/thường).
# Danh sách này khớp với các block type CV Builder của Worklify đã hỗ trợ
# (candidate_activities, candidate_awards, candidate_certifications,
# candidate_hobbies, candidate_projects trong DB) — cần nhận diện đủ, tránh
# 1 section "nuốt" hết nội dung section sau nó do không tìm thấy boundary.
_SECTION_HEADINGS = {
    "education": [
        r"education", r"academic\s*background",
    ],
    "experience": [
        r"experience", r"work\s*history", r"employment\s*history",
    ],
    "skills": [
        r"skills", r"technical\s*skills",
    ],
    "summary": [
        r"summary", r"objective", r"about\s*me", r"profile",
        r"career\s*(goal|objective)",
    ],
    "activities": [
        r"activit\w*", r"extracurricular",
    ],
    "certifications": [
        r"certificat\w*",
    ],
    "awards": [
        r"awards?", r"honou?rs?",
    ],
    "hobbies": [
        r"hobb\w*", r"interests?",
    ],
    "projects": [
        r"projects?",
    ],
    "references": [
        r"references?", r"referee",
    ],
}


def extract_contact(text: str) -> ContactInfo:
    email = _first_match(_EMAIL_RE, text)
    phone = _first_match(_PHONE_RE, text)
    linkedin = _first_match(_LINKEDIN_RE, text)
    github = _first_match(_GITHUB_RE, text)

    return ContactInfo(
        email=_to_field(email, confidence=0.95 if email else 0.0),
        phone=_to_field(phone, confidence=0.9 if phone else 0.0),
        linkedin_url=_to_field(linkedin, confidence=0.9 if linkedin else 0.0),
        github_url=_to_field(github, confidence=0.9 if github else 0.0),
    )


def split_sections(text: str) -> dict[str, str]:
    """
    Cắt CV thành các khối theo heading. Trả về dict {section_name: block_text}.
    Section không tìm thấy heading sẽ vắng mặt trong dict (không phải lỗi —
    nhiều CV không có heading rõ ràng, để lại cho NER xử lý ở Giai đoạn 3).
    """
    lines = text.splitlines()
    heading_pattern = re.compile(
        "|".join(
            f"(?P<{name}>{'|'.join(patterns)})"
            for name, patterns in _SECTION_HEADINGS.items()
        ),
        re.I,
    )

    markers: list[tuple[int, str]] = []
    for i, line in enumerate(lines):
        stripped = line.strip()
        # Heading thường ngắn (<6 từ) và không kết thúc bằng dấu câu thường thấy
        # trong câu văn -> giảm false positive khi từ khóa xuất hiện giữa câu
        if len(stripped.split()) <= 6:
            m = heading_pattern.search(stripped)
            if m:
                section_name = m.lastgroup
                markers.append((i, section_name))

    sections: dict[str, str] = {}
    for idx, (line_no, name) in enumerate(markers):
        end = markers[idx + 1][0] if idx + 1 < len(markers) else len(lines)
        block = "\n".join(lines[line_no + 1 : end]).strip()
        if block:
            sections[name] = block

    return sections


def extract_skills(
    skills_block: str, skill_catalog: dict[str, int]
) -> list[SkillItem]:
    """
    Dictionary lookup: so khớp text trong block "Kỹ năng" với skill_catalog
    (lấy từ bảng reference_values qua backend-core).

    skill_catalog: {skill_name_lowercase: skill_id}

    Vì skill catalog là closed-set, cách này chính xác hơn NER cho riêng
    trường skill, và không cần train gì cả.

    Match 2 tầng vì dấu "/" mang 2 ý nghĩa xung đột nhau tùy ngữ cảnh:
    - Trong CV: thường là dấu liệt kê nhiều skill khác nhau
      (vd "PHP / JavaScript / MySQL" = 3 skill riêng biệt)
    - Trong catalog thực tế (reference_values): có thể là 1 phần tên skill
      ghép (vd "PHP / Laravel" = 1 skill duy nhất trong DB)
    Nên PHẢI thử khớp cả cụm gốc (chưa tách theo "/") trước; chỉ tách nhỏ
    theo "/" làm fallback khi cụm gốc không khớp catalog nào — tránh phá vỡ
    đúng những skill ghép có thật trong catalog.
    """
    if not skills_block:
        return []

    # Tầng 1: tách theo dấu phẩy/chấm phẩy/xuống dòng — KHÔNG tách theo "/"
    # ở bước này, để giữ nguyên cụm ghép có thể khớp thẳng catalog.
    coarse_candidates = re.split(r"[,;\n•·|]", skills_block)

    found: list[SkillItem] = []
    seen_ids: set[int] = set()

    for raw in coarse_candidates:
        cleaned = raw.strip(" -\t")
        if not cleaned:
            continue

        skill_id = skill_catalog.get(cleaned.lower())
        if skill_id is not None:
            _add_matched(found, seen_ids, cleaned, skill_id)
            continue

        # Cụm gốc không khớp -> fallback tách nhỏ theo "/" và thử khớp từng
        # phần riêng (case "PHP / JavaScript / MySQL" — 3 skill khác nhau,
        # không có trong catalog dưới dạng cụm ghép).
        if "/" in cleaned:
            sub_parts = [p.strip() for p in cleaned.split("/") if p.strip()]
            any_sub_matched = False
            for part in sub_parts:
                sub_skill_id = skill_catalog.get(part.lower())
                if sub_skill_id is not None:
                    _add_matched(found, seen_ids, part, sub_skill_id)
                    any_sub_matched = True
                else:
                    found.append(SkillItem(name=part, matched_skill_id=None, confidence=0.2))
            if any_sub_matched:
                continue
        else:
            # Không có "/" để fallback -> giữ nguyên như cũ, confidence thấp
            found.append(SkillItem(name=cleaned, matched_skill_id=None, confidence=0.2))

    return found


def _add_matched(found: list[SkillItem], seen_ids: set[int], name: str, skill_id: int) -> None:
    if skill_id in seen_ids:
        return
    seen_ids.add(skill_id)
    found.append(SkillItem(name=name, matched_skill_id=skill_id, confidence=0.9))


def extract_educations(education_block: str) -> list[EducationItem]:
    """
    Baseline đơn giản: coi mỗi đoạn cách nhau bởi dòng trống là 1 mục học vấn.
    Đây là phần rule-based yếu nhất — NER (Giai đoạn 3) sẽ cải thiện đáng kể
    độ chính xác so với heuristic này, đặc biệt với CV không có format rõ ràng.
    """
    if not education_block:
        return []

    chunks = [c.strip() for c in re.split(r"\n\s*\n", education_block) if c.strip()]
    items = []
    for chunk in chunks:
        items.append(EducationItem(raw_text=chunk))
    return items


def extract_experiences(experience_block: str) -> list[ExperienceItem]:
    """Tương tự extract_educations — baseline thô, chờ NER thay thế."""
    if not experience_block:
        return []

    chunks = [c.strip() for c in re.split(r"\n\s*\n", experience_block) if c.strip()]
    items = []
    for chunk in chunks:
        items.append(ExperienceItem(raw_text=chunk))
    return items


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _first_match(pattern: re.Pattern, text: str) -> str | None:
    m = pattern.search(text)
    return m.group(0) if m else None


def _to_field(value: str | None, confidence: float) -> ExtractedField:
    return ExtractedField(value=value, confidence=confidence)