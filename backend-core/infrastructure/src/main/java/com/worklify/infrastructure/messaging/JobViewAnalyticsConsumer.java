package com.worklify.infrastructure.messaging;

import com.worklify.infrastructure.config.KafkaConfig;
import com.worklify.infrastructure.messaging.dto.JobViewEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Consumer group "analytics" - đếm số lượt xem theo từng jobId.
 * Đọc độc lập với JobViewAuditLogConsumer - minh chứng khả năng
 * "nhiều consumer group cùng đọc 1 topic độc lập" của Kafka.
 */
@Slf4j
@Component
public class JobViewAnalyticsConsumer {

    // Demo mock - lưu counter trong memory, không cần bảng DB thật
    private final Map<Long, Integer> viewCountByJobId = new ConcurrentHashMap<>();

    @KafkaListener(
            topics = KafkaConfig.TOPIC_JOB_VIEW,
            groupId = "worklify-analytics-group"
    )
    public void onJobViewed(JobViewEvent event) {
        viewCountByJobId.merge(event.getJobId(), 1, Integer::sum);
        log.info("[analytics] jobId={} -> tổng lượt xem={}", event.getJobId(), viewCountByJobId.get(event.getJobId()));
    }

    public Map<Long, Integer> getViewCountSnapshot() {
        return Map.copyOf(viewCountByJobId);
    }
}