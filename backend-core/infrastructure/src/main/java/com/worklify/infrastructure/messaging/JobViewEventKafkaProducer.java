package com.worklify.infrastructure.messaging;

import com.worklify.application.job.port.JobViewEventPublisherPort;
import com.worklify.infrastructure.config.KafkaConfig;
import com.worklify.infrastructure.messaging.dto.JobViewEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.time.Instant;

/**
 * Adapter implement JobViewEventPublisherPort bằng Kafka.
 * Dùng jobId làm partition key để đảm bảo thứ tự event trong cùng 1 job (đúng lý thuyết ordering-per-partition).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JobViewEventKafkaProducer implements JobViewEventPublisherPort {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    public void publishJobViewed(Long jobId, Long viewerUserId) {
        JobViewEvent event = JobViewEvent.builder()
                .jobId(jobId)
                .viewerUserId(viewerUserId)
                .timestamp(Instant.now())
                .build();

        // fire-and-forget: không để lỗi Kafka làm ảnh hưởng luồng xem job chính
        kafkaTemplate.send(KafkaConfig.TOPIC_JOB_VIEW, String.valueOf(jobId), event)
                .exceptionally(ex -> {
                    log.warn("Không publish được JobViewEvent cho jobId={}: {}", jobId, ex.getMessage());
                    return null;
                });
    }
}