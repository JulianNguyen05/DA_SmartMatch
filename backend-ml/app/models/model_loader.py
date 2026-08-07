# app/models/model_loader.py
"""
Load model NER đã fine-tune (Giai đoạn 3) và expose hàm predict_entities()
cho parser_service.py dùng.

Dùng transformers.pipeline(..., aggregation_strategy="simple") thay vì tự
viết code gộp BIO -> span: pipeline này đã tự làm đúng việc gộp các token
liên tiếp B-X/I-X thành 1 entity, kèm confidence score trung bình và
start/end THEO KÝ TỰ GỐC trong text đầu vào (không phải theo token) — tự
viết lại logic này dễ sai hơn dùng thư viện đã test kỹ.
"""
from __future__ import annotations

import logging
from pathlib import Path
from typing import TypedDict

logger = logging.getLogger("worklify.ner_model")

# Model đã fine-tune (Giai đoạn 3) cần được copy vào đây, KHÔNG load thẳng từ
# ml_training/model_output/ner_best — tách biệt thư mục training (scratch,
# không deploy) khỏi thư mục model dùng thật trong service (deploy cùng image).
# Copy: ml_training/model_output/ner_best/*  ->  app/models/ner_model/
_MODEL_DIR = Path(__file__).parent / "ner_model"


class EntitySpan(TypedDict):
    label: str          # vd "Skills", "Degree" — khớp tag_names lúc train
    text: str            # nội dung text gốc của entity
    start: int           # offset ký tự bắt đầu trong text gốc
    end: int              # offset ký tự kết thúc
    confidence: float   # trung bình score các token trong entity (0-1)


class NerModel:
    """
    Singleton, lazy-load: model chỉ thực sự load vào RAM ở lần gọi predict()
    đầu tiên, không load ngay lúc import module (tránh làm chậm mọi request
    khác nếu model chưa cần dùng ngay, và tránh crash lúc import nếu model
    chưa được copy vào _MODEL_DIR trong giai đoạn dev).
    """

    _instance: "NerModel | None" = None

    def __init__(self):
        self._pipeline = None
        self._load_error: Exception | None = None

    @classmethod
    def instance(cls) -> "NerModel":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    @property
    def is_available(self) -> bool:
        """
        True nếu model đã (hoặc load được) thành công. parser_service dùng
        cờ này để quyết định fallback về rule-based thuần khi model chưa có
        sẵn (vd môi trường dev chưa copy model vào, hoặc model bị lỗi).
        """
        if self._pipeline is not None:
            return True
        if self._load_error is not None:
            return False
        return self._try_load()

    def _try_load(self) -> bool:
        if not _MODEL_DIR.exists() or not any(_MODEL_DIR.iterdir()):
            logger.warning(
                "Không tìm thấy model NER tại %s — parser sẽ chỉ dùng "
                "rule-based extraction. Copy model đã train vào thư mục này "
                "để bật NER (xem ml_training/train_ner.py).",
                _MODEL_DIR,
            )
            self._load_error = FileNotFoundError(str(_MODEL_DIR))
            return False

        try:
            # Import trễ (không để ở top-level module) vì torch/transformers
            # nặng — chỉ tốn thời gian import khi thực sự cần dùng NER,
            # không ảnh hưởng tới các request chỉ dùng rule-based/matcher.
            import torch
            from transformers import pipeline

            self._pipeline = pipeline(
                task="token-classification",
                model=str(_MODEL_DIR),
                tokenizer=str(_MODEL_DIR),
                aggregation_strategy="simple",
                device=0 if torch.cuda.is_available() else -1,
            )
            logger.info("Đã load model NER từ %s", _MODEL_DIR)
            return True
        except Exception as e:
            logger.exception("Lỗi khi load model NER tại %s", _MODEL_DIR)
            self._load_error = e
            return False

    def predict_entities(self, text: str) -> list[EntitySpan]:
        """
        Trả về danh sách entity đã gộp span, sort theo start. Nếu model
        chưa load được, trả về [] thay vì raise — caller (parser_service)
        tự quyết định fallback, không để lỗi model làm sập cả request parse.
        """
        if not self.is_available or self._pipeline is None:
            return []

        try:
            raw_results = self._pipeline(text)
        except Exception:
            logger.exception("Lỗi khi chạy inference NER, trả về rỗng")
            return []

        spans: list[EntitySpan] = [
            {
                "label": r["entity_group"],
                "text": r["word"],
                "start": int(r["start"]),
                "end": int(r["end"]),
                "confidence": float(r["score"]),
            }
            for r in raw_results
        ]
        spans.sort(key=lambda s: s["start"])
        return spans


def get_ner_model() -> NerModel:
    return NerModel.instance()