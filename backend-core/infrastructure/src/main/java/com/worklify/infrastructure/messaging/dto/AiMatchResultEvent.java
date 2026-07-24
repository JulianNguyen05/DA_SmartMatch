package com.worklify.infrastructure.messaging.dto;

import java.time.LocalDateTime;

/**
 * Payload nhận được từ backend-ml (Python) qua queue "worklify.ai.result.queue".
 * Cấu trúc field phải khớp với JSON mà consumer bên Python gửi lên (camelCase).
 *
 * LƯU Ý: hiện tại matchScore là giá trị STUB (sinh ngẫu nhiên bên backend-ml)
 * vì tính năng matching thật (matcher_service.py) chưa hoàn thiện.
 */
public record AiMatchResultEvent(
        Long applicationId,
        Long jobId,
        Long candidateId,
        Double matchScore,
        LocalDateTime processedAt
) {}
