# app/api/router.py
from fastapi import APIRouter

from app.api.endpoints import parser

router = APIRouter()
router.include_router(parser.router)

# matcher.py hiện chưa có endpoint thật (matching score đang chạy stub qua
# RabbitMQ consumer riêng, xem app/messaging/rabbitmq_consumer.py — không
# phải REST endpoint). Khi matcher.py có route thật, thêm dòng:
#   from app.api.endpoints import matcher
#   router.include_router(matcher.router)