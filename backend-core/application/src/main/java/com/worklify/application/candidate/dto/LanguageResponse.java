package com.worklify.application.candidate.dto;

import lombok.Builder;
import lombok.Data;

/**
 * [ĐÃ SỬA] Thêm languageId + languageName. languageName được service resolve
 * ngược từ ReferenceValue(languageId) để FE hiển thị mà không cần gọi thêm API.
 */
@Data
@Builder
public class LanguageResponse {
    private Long id;
    private Long languageId;
    private String languageName;
    private String proficiency;
    private int displayOrder;
}