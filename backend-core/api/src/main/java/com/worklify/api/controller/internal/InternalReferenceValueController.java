// backend-core/api/src/main/java/com/worklify/api/controller/internal/InternalReferenceValueController.java
package com.worklify.api.controller.internal;

import com.worklify.api.common.response.ApiResponse;
import com.worklify.application.candidate.service.CandidateService;
import com.worklify.application.referencedata.dto.ReferenceValueResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

/**
 * Endpoint nội bộ, chỉ dành cho service khác trong hệ thống gọi (vd. backend-ml)
 * — KHÔNG dành cho frontend/client bên ngoài.
 *
 * Path "/api/internal/**" được permitAll trong SecurityConfig (bỏ qua JwtAuthenticationFilter
 * vì caller không có JWT của user), nên controller này tự kiểm tra API key trong header
 * để tránh bị gọi công khai không kiểm soát.
 *
 * LƯU Ý: đang tái dùng CandidateService.searchReferenceValues dù nó nằm trong bounded
 * context "candidate" — vì đây là method application-layer duy nhất hiện có để lấy
 * ReferenceValue theo type. Nếu sau này có nhiều consumer nội bộ khác cần reference data,
 * nên tách ReferenceValueService riêng thay vì tiếp tục mượn qua CandidateService.
 */
@RestController
@RequestMapping("/api/internal")
@RequiredArgsConstructor
@Tag(name = "Internal", description = "API nội bộ cho service khác (backend-ml) — không dùng cho frontend")
public class InternalReferenceValueController {

    private final CandidateService candidateService;

    // Đặt trong application.yml: worklify.internal.api-key: ${INTERNAL_API_KEY:...}
    // Giá trị mặc định dưới đây CHỈ dùng cho local dev, phải override bằng env var khi deploy.
    @Value("${worklify.internal.api-key:local-dev-only-change-me}")
    private String internalApiKey;

    @GetMapping("/reference-values")
    @Operation(summary = "Lấy toàn bộ danh mục reference value theo type (vd. SKILL) — dùng cho backend-ml")
    public ApiResponse<List<ReferenceValueResponse>> getAllByType(
            @RequestParam("type") String type,
            @RequestHeader("X-Internal-Api-Key") String apiKey) {

        if (!internalApiKey.equals(apiKey)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "API key không hợp lệ");
        }

        return ApiResponse.success(candidateService.searchReferenceValues(type, ""));
    }
}