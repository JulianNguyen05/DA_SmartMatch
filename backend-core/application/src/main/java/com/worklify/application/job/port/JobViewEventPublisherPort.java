package com.worklify.application.job.port;

/**
 * Port để publish sự kiện "xem chi tiết job" ra hệ thống event streaming (Kafka).
 * Tách biệt hoàn toàn khỏi luồng RabbitMQ (AI matching) - đây là port riêng cho activity tracking.
 */
public interface JobViewEventPublisherPort {
    void publishJobViewed(Long jobId, Long viewerUserId);
}