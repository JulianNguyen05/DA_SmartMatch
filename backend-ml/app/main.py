from fastapi import FastAPI

from app.messaging.rabbitmq_consumer import start_consumer_in_background

app = FastAPI(
    title="Worklify ML Service",
    description="Service xử lý CV parsing và matching score (đang xây dựng — hiện dùng stub điểm số)",
    version="0.1.0",
)


@app.on_event("startup")
def on_startup() -> None:
    # Khởi động thread lắng nghe queue "worklify.ai.submit.queue" từ backend-core.
    # Hiện tại chỉ sinh điểm STUB (xem app/messaging/rabbitmq_consumer.py).
    start_consumer_in_background()


@app.get("/health")
def health_check():
    return {"status": "ok"}
