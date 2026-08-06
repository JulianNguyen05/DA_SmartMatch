# ml_training/prepare_dataset.py
"""
Convert dataset dataturks/resume-entities-for-ner (character-span entities)
sang format BIO align với token của BERT tokenizer, lưu thành HuggingFace Dataset
để train_ner.py load trực tiếp.

Input format (mỗi dòng 1 JSON object, hoặc cả file là 1 JSON array):
{
  "content": "toàn bộ text CV",
  "annotation": [
    {"label": ["Skills"], "points": [{"start": 33, "end": 39, "text": "Python"}]},
    ...
  ]
}

Vì sao cần bước "align" riêng thay vì gán nhãn thẳng theo token của dataset gốc:
dataturks gán nhãn theo VỊ TRÍ KÝ TỰ (character offset) trong text gốc, còn
BERT tokenizer tách theo SUBWORD (vd "Django" -> "Dj", "##ango"). Phải map
lại offset ký tự -> offset token bằng offset_mapping của tokenizer, rồi mới
gán B-/I- cho đúng token, nếu không model sẽ học sai vị trí nhãn hoàn toàn.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

from datasets import Dataset, DatasetDict, ClassLabel, Sequence, Value, Features
from transformers import AutoTokenizer

MODEL_CHECKPOINT = "bert-base-cased"  # cased vì "Python", "Django"... phân biệt hoa/thường có ý nghĩa
MAX_LENGTH = 512


def load_dataturks_file(path: Path) -> list[dict]:
    """Đọc file, tự nhận diện JSONL (mỗi dòng 1 object) hay JSON array."""
    raw = path.read_text(encoding="utf-8").strip()

    if raw.startswith("["):
        return json.loads(raw)

    records = []
    for line_no, line in enumerate(raw.splitlines(), start=1):
        line = line.strip()
        if not line:
            continue
        try:
            records.append(json.loads(line))
        except json.JSONDecodeError as e:
            print(f"[CẢNH BÁO] Bỏ qua dòng {line_no} lỗi JSON: {e}", file=sys.stderr)
    return records


# Nhãn cần loại bỏ trước khi train: chất lượng thấp trong dataset gốc hoặc
# đã có regex xử lý tốt hơn NER (xem rule_based_extractor.py).
# - "Email Address" trong dataset này thực chất trỏ vào URL profile Indeed,
#   không phải email thật — giữ lại sẽ khiến model học sai.
# - "UNKNOWN" là nhãn rác từ quá trình crowd-labeling gốc của dataturks,
#   không mang thông tin gì hữu ích cho bài toán CV parsing.
EXCLUDED_LABELS = {"Email Address", "UNKNOWN"}


def extract_entities(record: dict) -> tuple[str, list[tuple[int, int, str]]]:
    """
    Trả về (text, entities) với entities = [(start, end, label), ...],
    đã lọc bỏ entity rỗng/points thiếu/label nằm trong EXCLUDED_LABELS.
    """
    text = record.get("content", "")
    entities: list[tuple[int, int, str]] = []

    for ann in record.get("annotation") or []:
        labels = ann.get("label") or []
        points = ann.get("points") or []
        if not labels or not points:
            continue
        label = labels[0]  # dataturks luôn để label dạng list 1 phần tử
        if label in EXCLUDED_LABELS:
            continue
        for p in points:
            start, end = p.get("start"), p.get("end")
            if start is None or end is None or start >= end:
                continue
            entities.append((start, end, label))

    # Sắp xếp theo start để xử lý overlap dễ hơn ở bước align
    entities.sort(key=lambda e: e[0])
    return text, entities


def discover_label_set(records: list[dict]) -> list[str]:
    """Quét toàn bộ file để lấy danh sách entity type thực tế có trong data,
    thay vì hardcode — dataturks có nhiều biến thể label giữa các bản dataset."""
    labels: set[str] = set()
    for r in records:
        _, entities = extract_entities(r)
        for _, _, label in entities:
            labels.add(label)
    return sorted(labels)


def build_bio_tag_names(entity_labels: list[str]) -> list[str]:
    tags = ["O"]
    for label in entity_labels:
        tags.append(f"B-{label}")
        tags.append(f"I-{label}")
    return tags


def align_labels_with_tokens(
    text: str,
    entities: list[tuple[int, int, str]],
    tokenizer,
    tag2id: dict[str, int],
) -> tuple[list[int], list[int]]:
    """
    Tokenize text, trả về (input_ids, label_ids) đã align.
    label_ids dùng -100 cho special token (CLS/SEP/PAD) và cho subword thứ 2 trở
    đi của cùng 1 từ (convention chuẩn của HuggingFace: chỉ tính loss trên
    subword đầu tiên của mỗi từ, tránh model bị lệch trọng số vì từ dài bị tách
    nhiều subword hơn từ ngắn).
    """
    encoding = tokenizer(
        text,
        truncation=True,
        max_length=MAX_LENGTH,
        return_offsets_mapping=True,
    )
    offsets = encoding["offset_mapping"]
    label_ids = []

    # Con trỏ theo dõi entity hiện tại đang xét, để không phải quét lại từ đầu
    # cho mỗi token (text CV có thể dài, entities đã sort theo start)
    entity_idx = 0
    prev_word_had_label: str | None = None  # entity label của token trước, để biết B- hay I-

    for offset_start, offset_end in offsets:
        if offset_start == offset_end:
            # special token (CLS, SEP, PAD) luôn có offset (0,0)
            label_ids.append(-100)
            prev_word_had_label = None
            continue

        # Tìm entity chứa token này (nếu có)
        while entity_idx < len(entities) and entities[entity_idx][1] <= offset_start:
            entity_idx += 1

        matched_label = None
        if entity_idx < len(entities):
            e_start, e_end, e_label = entities[entity_idx]
            if e_start <= offset_start < e_end:
                matched_label = e_label

        if matched_label is None:
            label_ids.append(tag2id["O"])
            prev_word_had_label = None
        elif matched_label == prev_word_had_label:
            label_ids.append(tag2id[f"I-{matched_label}"])
        else:
            label_ids.append(tag2id[f"B-{matched_label}"])
            prev_word_had_label = matched_label

    return encoding["input_ids"], label_ids


def main():
    if len(sys.argv) != 2:
        print("Dùng: python prepare_dataset.py <đường-dẫn-file-dataturks.json>")
        sys.exit(1)

    input_path = Path(sys.argv[1])
    records = load_dataturks_file(input_path)
    print(f"Đọc được {len(records)} CV từ {input_path}")

    entity_labels = discover_label_set(records)
    print(f"Phát hiện {len(entity_labels)} loại entity: {entity_labels}")

    tag_names = build_bio_tag_names(entity_labels)
    tag2id = {t: i for i, t in enumerate(tag_names)}

    try:
        tokenizer = AutoTokenizer.from_pretrained(MODEL_CHECKPOINT)
    except Exception as e:
        if "SSLError" in str(type(e)) or "SSL" in str(e) or "CERTIFICATE_VERIFY_FAILED" in str(e):
            print(
                "\n[LỖI SSL] Không tải được tokenizer từ huggingface.co do lỗi "
                "xác thực chứng chỉ (thường gặp trên mạng trường/ký túc xá, "
                "hoặc bundle chứng chỉ Python bị cũ).\n"
                "Thử theo thứ tự:\n"
                "  1) pip install --upgrade certifi\n"
                "     rồi set biến môi trường SSL_CERT_FILE và REQUESTS_CA_BUNDLE\n"
                "     trỏ tới đường dẫn in ra từ: python -c \"import certifi; print(certifi.where())\"\n"
                "  2) Nếu vẫn lỗi, thử đổi sang mạng khác (4G/hotspot) để loại trừ\n"
                "     nguyên nhân do mạng đang chặn/inspect HTTPS.\n",
                file=sys.stderr,
            )
        raise

    all_input_ids, all_labels = [], []
    skipped = 0
    for r in records:
        text, entities = extract_entities(r)
        if not text.strip():
            skipped += 1
            continue
        input_ids, label_ids = align_labels_with_tokens(text, entities, tokenizer, tag2id)
        all_input_ids.append(input_ids)
        all_labels.append(label_ids)

    if skipped:
        print(f"Bỏ qua {skipped} record rỗng content")

    features = Features({
        "input_ids": Sequence(Value("int32")),
        "labels": Sequence(ClassLabel(names=tag_names)),
    })
    full_dataset = Dataset.from_dict(
        {"input_ids": all_input_ids, "labels": all_labels}, features=features
    )

    # Split 70/15/15 — cố định seed để tái lập được kết quả giữa các lần chạy
    split_1 = full_dataset.train_test_split(test_size=0.3, seed=42)
    split_2 = split_1["test"].train_test_split(test_size=0.5, seed=42)
    dataset_dict = DatasetDict({
        "train": split_1["train"],
        "validation": split_2["train"],
        "test": split_2["test"],
    })

    output_dir = Path(__file__).parent / "data" / "processed"
    dataset_dict.save_to_disk(str(output_dir))

    label_map_path = Path(__file__).parent / "data" / "label_map.json"
    label_map_path.write_text(
        json.dumps({"tag_names": tag_names}, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    print(f"\nĐã lưu dataset đã xử lý vào: {output_dir}")
    print(f"Train: {len(dataset_dict['train'])} | Val: {len(dataset_dict['validation'])} | Test: {len(dataset_dict['test'])}")
    print(f"Label map: {label_map_path}")


if __name__ == "__main__":
    main()