"""
STUB consumer cho luồng AI matching qua RabbitMQ.

Vai trò: lắng nghe queue "worklify.ai.submit.queue" (do backend-core Java gửi lên
mỗi khi có đơn ứng tuyển mới), sinh ra 1 điểm matching GIẢ (ngẫu nhiên), rồi gửi
kết quả trả về queue "worklify.ai.result.queue" để backend-core nhận lại.

MỤC ĐÍCH: xác nhận toàn bộ luồng RabbitMQ (Java -> RabbitMQ -> Python -> RabbitMQ -> Java)
chạy đúng, TRƯỚC KHI tính năng matching thật (matcher_service.py) được hoàn thiện.

KHI MATCHER_SERVICE SẴN SÀNG: chỉ cần thay lời gọi _generate_stub_score() bằng
lời gọi thực tế đến matcher_service.match_score(...), giữ nguyên toàn bộ phần
kết nối/consume/publish bên dưới.
"""

import json
import logging
import random
import threading
from datetime import datetime

import pika

logger = logging.getLogger("worklify.rabbitmq")

# Nếu backend-ml chạy trong cùng docker network với rabbitmq, đổi "localhost" -> "rabbitmq"
RABBITMQ_HOST = "localhost"
RABBITMQ_PORT = 5672
RABBITMQ_USER = "worklify"
RABBITMQ_PASSWORD = "worklify_password"

EXCHANGE_NAME = "worklify.domain.exchange"
QUEUE_AI_SUBMIT = "worklify.ai.submit.queue"
ROUTING_KEY_AI_RESULT = "ai.result"


def _generate_stub_score() -> float:
    """
    STUB: sinh điểm ngẫu nhiên trong khoảng hợp lý (0.3 - 0.95) để giả lập
    kết quả matching. Thay bằng logic thật trong matcher_service.py sau này.
    """
    return round(random.uniform(0.3, 0.95), 2)


def _on_ai_submit_message(channel, method, properties, body):
    try:
        payload = json.loads(body)
        logger.info("Nhận yêu cầu matching từ backend-core: %s", payload)

        # TODO: thay dòng dưới bằng matcher_service.match_score(payload) khi hoàn thiện
        score = _generate_stub_score()

        result = {
            "applicationId": payload.get("applicationId"),
            "jobId": payload.get("jobId"),
            "candidateId": payload.get("candidateId"),
            "matchScore": score,
            # QUAN TRỌNG: dùng giờ local, KHÔNG kèm timezone (naive datetime),
            # vì phía Java deserialize sang java.time.LocalDateTime — kiểu này
            # không có timezone, nếu chuỗi có "+00:00" sẽ bị lỗi parse.
            "processedAt": datetime.now().isoformat(),
        }

        channel.basic_publish(
            exchange=EXCHANGE_NAME,
            routing_key=ROUTING_KEY_AI_RESULT,
            body=json.dumps(result),
        )
        logger.info("Đã gửi kết quả matching (STUB) về backend-core: %s", result)

        channel.basic_ack(delivery_tag=method.delivery_tag)
    except Exception:
        logger.exception("Lỗi khi xử lý message từ queue %s", QUEUE_AI_SUBMIT)
        channel.basic_nack(delivery_tag=method.delivery_tag, requeue=False)


def _run_consumer():
    credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASSWORD)
    connection = pika.BlockingConnection(
        pika.ConnectionParameters(host=RABBITMQ_HOST, port=RABBITMQ_PORT, credentials=credentials)
    )
    channel = connection.channel()
    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(queue=QUEUE_AI_SUBMIT, on_message_callback=_on_ai_submit_message)

    logger.info("Bắt đầu lắng nghe queue '%s'...", QUEUE_AI_SUBMIT)
    channel.start_consuming()


def start_consumer_in_background() -> None:
    """Gọi hàm này trong sự kiện startup của FastAPI (xem app/main.py)."""
    thread = threading.Thread(target=_run_consumer, daemon=True, name="rabbitmq-ai-submit-consumer")
    thread.start()
