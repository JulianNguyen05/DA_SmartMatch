package com.worklify.api.controller.demo;

import com.worklify.api.common.response.ApiResponse;
import com.worklify.infrastructure.messaging.JobViewAnalyticsConsumer;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Endpoint demo trực quan cho Kafka Activity Tracking - không dùng cho production.
 */
@RestController
@RequestMapping("/api/v1/demo")
@RequiredArgsConstructor
@Tag(name = "Demo - Kafka Activity Tracking", description = "Endpoint minh họa cho phần demo Kafka")
public class DemoActivityController {

    private final JobViewAnalyticsConsumer analyticsConsumer;

    @GetMapping("/job-view-stats")
    @Operation(summary = "Xem thống kê lượt xem job (đọc từ Kafka consumer group 'analytics')")
    public ApiResponse<Map<Long, Integer>> getJobViewStats() {
        return ApiResponse.success(analyticsConsumer.getViewCountSnapshot());
    }
}