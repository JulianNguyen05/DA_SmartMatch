import logging
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI

from app.api.router import router as api_router
from app.messaging.rabbitmq_consumer import start_consumer_in_background

# Cấu hình logging ở mức root để log INFO của "worklify.rabbitmq" (và các logger khác)
# thực sự hiện ra console — mặc định Python chỉ in từ WARNING trở lên nếu không có dòng này.
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Khởi động thread lắng nghe queue "worklify.ai.submit.queue" từ backend-core.
    # Hiện tại chỉ sinh điểm STUB (xem app/messaging/rabbitmq_consumer.py).
    start_consumer_in_background()
    yield
    # (Không cần cleanup gì thêm khi tắt app ở giai đoạn stub này)


app = FastAPI(
    title="Worklify ML Service",
    description="Service xử lý CV parsing và matching score (đang xây dựng — hiện dùng stub điểm số)",
    version="0.1.0",
    lifespan=lifespan,
)

app.include_router(api_router)


@app.get("/health")
def health_check():
    return {"status": "ok"}


if __name__ == "__main__":
    # Cho phép chạy trực tiếp qua nút Run của IDE (python app/main.py),
    # tương đương lệnh: uvicorn app.main:app --reload --port 8000
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)