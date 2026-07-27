package com.worklify.infrastructure.messaging.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Sự kiện "xem chi tiết job" - dùng cho demo Activity Tracking qua Kafka.
 * viewerUserId có thể null (khách xem chưa đăng nhập).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobViewEvent {
    private Long jobId;
    private Long viewerUserId;
    private Instant timestamp;
}