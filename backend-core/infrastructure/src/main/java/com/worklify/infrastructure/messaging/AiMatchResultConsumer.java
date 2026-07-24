package com.worklify.infrastructure.messaging;

import com.worklify.infrastructure.config.RabbitMqConfig;
import com.worklify.infrastructure.messaging.dto.AiMatchResultEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

/**
 * Lắng nghe kết quả matching trả về từ backend-ml qua queue "worklify.ai.result.queue".
 *
 * TRẠNG THÁI HIỆN TẠI: tính năng scoring nghiệp vụ (lưu matchScore vào Application,
 * hiển thị lên UI cho employer...) CHƯA được xây dựng. Consumer này hiện chỉ log lại
 * để xác nhận luồng RabbitMQ (submit -> backend-ml -> result) chạy đúng end-to-end.
 *
 * KHI SCORING FEATURE SẴN SÀNG: bổ sung logic lưu event.matchScore() vào entity
 * tương ứng ngay trong method handleAiMatchResult() bên dưới — không cần đổi gì
 * ở RabbitMqConfig hay DomainEventRabbitMqDispatcher.
 */
@Slf4j
@Component
public class AiMatchResultConsumer {

    @RabbitListener(queues = RabbitMqConfig.QUEUE_AI_RESULT)
    public void handleAiMatchResult(AiMatchResultEvent event) {
        log.info(
                "[RabbitMQ -> Domain] Nhận kết quả matching (STUB) cho applicationId={}, jobId={}, candidateId={}: score={}",
                event.applicationId(), event.jobId(), event.candidateId(), event.matchScore()
        );

        // TODO: khi matcher_service.py hoàn thiện, thêm bước lưu matchScore
        // vào Application (hoặc bảng match_result riêng nếu domain model cần tách ra).
    }
}
