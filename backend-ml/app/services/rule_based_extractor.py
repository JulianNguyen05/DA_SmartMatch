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

# Heading phổ biến trong CV tiếng Việt lẫn tiếng Anh (không phân biệt hoa/thường)
_SECTION_HEADINGS = {
    "education": [
        r"h[oọ]c\s*v[aấ]n", r"education", r"academic\s*background",
    ],
    "experience": [
        r"kinh\s*nghi[eệ]m", r"experience", r"work\s*history",
        r"qu[aá]\s*tr[iì]nh\s*l[aà]m\s*vi[eệ]c",
    ],
    "skills": [
        r"k[yỹ]\s*n[aă]ng", r"skills", r"technical\s*skills",
    ],
    "summary": [
        r"gi[oớ]i\s*thi[eệ]u", r"summary", r"objective", r"about\s*me",
        r"m[uụ]c\s*ti[eê]u",
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
    """
    if not skills_block:
        return []

    # Tách theo dấu phẩy, chấm phẩy, hoặc xuống dòng — layout skill block
    # thường là danh sách rời rạc chứ không phải câu văn liền mạch
    candidates = re.split(r"[,;\n•·|]", skills_block)

    found: list[SkillItem] = []
    seen_ids: set[int] = set()
    for raw in candidates:
        cleaned = raw.strip(" -\t").lower()
        if not cleaned:
            continue
        skill_id = skill_catalog.get(cleaned)
        if skill_id is not None and skill_id not in seen_ids:
            seen_ids.add(skill_id)
            found.append(SkillItem(name=raw.strip(), matched_skill_id=skill_id, confidence=0.9))
        else:
            # Không khớp catalog -> vẫn trả về để người dùng tự thêm reference
            # value mới nếu cần, nhưng đánh dấu confidence thấp
            found.append(SkillItem(name=raw.strip(), matched_skill_id=None, confidence=0.2))

    return found


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