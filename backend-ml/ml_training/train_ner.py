# ml_training/train_ner.py
"""
Fine-tune bert-base-cased cho bài toán Token Classification (NER) trên
dataset đã convert bởi prepare_dataset.py.

Chạy: python train_ner.py
Output: model đã fine-tune lưu ở model_output/ner_best/, dùng cho
        app/models/model_loader.py ở Giai đoạn 4 (tích hợp vào service thật).
"""
from __future__ import annotations

import os

# Tắt hẳn nhánh TensorFlow trong transformers TRƯỚC khi import — máy có cài
# TensorFlow (Keras 3) sẽ khiến transformers cố import cả 2 backend và lỗi
# xung đột phiên bản Keras, dù script này chỉ cần PyTorch. Phải set biến môi
# trường này TRƯỚC dòng "from transformers import ..." mới có tác dụng.
os.environ.setdefault("USE_TF", "0")

import json
from pathlib import Path

import numpy as np
from datasets import load_from_disk
from seqeval.metrics import classification_report, f1_score, precision_score, recall_score
from transformers import (
    AutoModelForTokenClassification,
    AutoTokenizer,
    DataCollatorForTokenClassification,
    Trainer,
    TrainingArguments,
)

MODEL_CHECKPOINT = "bert-base-cased"
DATA_DIR = Path(__file__).parent / "data" / "processed"
LABEL_MAP_PATH = Path(__file__).parent / "data" / "label_map.json"
OUTPUT_DIR = Path(__file__).parent / "model_output"
BEST_MODEL_DIR = OUTPUT_DIR / "ner_best"

# Cùng cơ chế fallback local như prepare_dataset.py — nếu mạng vẫn chặn
# huggingface.co, tải thêm pytorch_model.bin (hoặc model.safetensors) từ
# https://huggingface.co/bert-base-cased/tree/main bỏ vào cùng thư mục
# model_cache/bert-base-cased/ đã tạo trước đó (cùng với 4 file tokenizer).
_LOCAL_MODEL_DIR = Path(__file__).parent / "model_cache" / "bert-base-cased"


def load_tag_names() -> list[str]:
    data = json.loads(LABEL_MAP_PATH.read_text(encoding="utf-8"))
    return data["tag_names"]


def build_compute_metrics(id2label: dict[int, str]):
    """
    Closure để compute_metrics của Trainer truy cập được id2label mà không
    cần biến global — Trainer chỉ truyền vào (predictions, labels) dạng số.
    """

    def compute_metrics(eval_pred):
        predictions, labels = eval_pred
        predictions = np.argmax(predictions, axis=2)

        # Bỏ token có label = -100 (CLS/SEP/PAD, subword thứ 2+) trước khi
        # đưa vào seqeval — seqeval tính F1 theo ENTITY (cả cụm), không phải
        # theo từng token riêng lẻ, nên cần convert id -> tag string trước.
        true_labels = [
            [id2label[l] for l in label_seq if l != -100]
            for label_seq in labels
        ]
        true_predictions = [
            [id2label[p] for p, l in zip(pred_seq, label_seq) if l != -100]
            for pred_seq, label_seq in zip(predictions, labels)
        ]

        report = classification_report(true_labels, true_predictions, output_dict=True, zero_division=0)

        metrics = {
            "precision": precision_score(true_labels, true_predictions, zero_division=0),
            "recall": recall_score(true_labels, true_predictions, zero_division=0),
            "f1": f1_score(true_labels, true_predictions, zero_division=0),
        }
        # Thêm F1 riêng từng entity type để biết entity nào model học tốt/kém
        # (quan trọng hơn overall F1 vì dataset nhỏ, các entity không đều nhau)
        for entity_type, scores in report.items():
            if isinstance(scores, dict) and "f1-score" in scores:
                metrics[f"f1_{entity_type}"] = scores["f1-score"]

        return metrics

    return compute_metrics


def main():
    tag_names = load_tag_names()
    id2label = {i: t for i, t in enumerate(tag_names)}
    label2id = {t: i for i, t in enumerate(tag_names)}
    print(f"Số lượng tag (bao gồm O): {len(tag_names)}")

    dataset = load_from_disk(str(DATA_DIR))
    print(f"Train: {len(dataset['train'])} | Val: {len(dataset['validation'])} | Test: {len(dataset['test'])}")

    if _LOCAL_MODEL_DIR.exists() and any(_LOCAL_MODEL_DIR.iterdir()):
        print(f"Dùng model/tokenizer local tại: {_LOCAL_MODEL_DIR} (không gọi mạng)")
        checkpoint_path = str(_LOCAL_MODEL_DIR)
        load_kwargs = {"local_files_only": True}
    else:
        checkpoint_path = MODEL_CHECKPOINT
        load_kwargs = {}

    tokenizer = AutoTokenizer.from_pretrained(checkpoint_path, **load_kwargs)
    model = AutoModelForTokenClassification.from_pretrained(
        checkpoint_path,
        num_labels=len(tag_names),
        id2label=id2label,
        label2id=label2id,
        **load_kwargs,
    )

    data_collator = DataCollatorForTokenClassification(tokenizer=tokenizer)

    # Dataset chỉ 154 mẫu train -> cần nhiều epoch hơn dataset lớn để model
    # học đủ, nhưng cũng dễ overfit -> load_best_model_at_end theo eval F1
    # để lấy đúng checkpoint tốt nhất, không phải checkpoint cuối cùng.
    training_args = TrainingArguments(
        output_dir=str(OUTPUT_DIR / "checkpoints"),
        eval_strategy="epoch",
        save_strategy="epoch",
        learning_rate=2e-5,
        per_device_train_batch_size=8,
        per_device_eval_batch_size=8,
        num_train_epochs=20,
        weight_decay=0.01,
        load_best_model_at_end=True,
        metric_for_best_model="f1",
        greater_is_better=True,
        save_total_limit=2,  # chỉ giữ 2 checkpoint gần nhất, tránh đầy ổ đĩa
        logging_steps=10,
        seed=42,
        report_to=[],  # tắt wandb/tensorboard, không cần cho đồ án
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=dataset["train"],
        eval_dataset=dataset["validation"],
        tokenizer=tokenizer,  # transformers==4.45.2 dùng "tokenizer", bản 4.46+ mới đổi tên thành "processing_class"
        data_collator=data_collator,
        compute_metrics=build_compute_metrics(id2label),
    )

    trainer.train()

    print("\n=== Đánh giá trên tập TEST (chưa từng thấy trong lúc train) ===")
    test_metrics = trainer.evaluate(dataset["test"])
    for k, v in sorted(test_metrics.items()):
        print(f"  {k}: {v:.4f}" if isinstance(v, float) else f"  {k}: {v}")

    BEST_MODEL_DIR.mkdir(parents=True, exist_ok=True)
    trainer.save_model(str(BEST_MODEL_DIR))
    tokenizer.save_pretrained(str(BEST_MODEL_DIR))

    metrics_path = OUTPUT_DIR / "test_metrics.json"
    metrics_path.write_text(
        json.dumps({k: v for k, v in test_metrics.items()}, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )

    print(f"\nĐã lưu model tốt nhất vào: {BEST_MODEL_DIR}")
    print(f"Metrics tập test lưu tại: {metrics_path}")


if __name__ == "__main__":
    main()