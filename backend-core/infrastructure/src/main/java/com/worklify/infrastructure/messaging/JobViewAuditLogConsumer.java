package com.worklify.infrastructure.messaging;

import com.worklify.infrastructure.config.KafkaConfig;
import com.worklify.infrastructure.messaging.dto.JobViewEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

/**
 * Consumer group "audit-log" - ghi log riêng cho mục đích audit/kiểm tra.
 * Mock: chỉ log ra console thay vì ghi file/DB thật.
 */
@Slf4j
@Component
public class JobViewAuditLogConsumer {

    @KafkaListener(
            topics = KafkaConfig.TOPIC_JOB_VIEW,
            groupId = "worklify-audit-log-group"
    )
    public void onJobViewed(JobViewEvent event) {
        log.info("[audit-log] Ghi nhận: jobId={}, viewerUserId={}, time={}",
                event.getJobId(), event.getViewerUserId(), event.getTimestamp());
    }
}