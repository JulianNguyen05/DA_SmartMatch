package com.worklify.application.candidate.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * [ĐÃ SỬA] languageName (String) -> languageId (Long). Candidate chọn ngôn ngữ
 * từ dropdown (GET /api/v1/reference-values?type=LANGUAGE&keyword=...) thay vì
 * gõ tự do, đảm bảo languageId luôn trỏ tới một ReferenceValue đã tồn tại.
 */
@Data
public class LanguageRequest {
    @NotNull(message = "languageId không được để trống")
    private Long languageId;
    private String proficiency;
    private int displayOrder;
}