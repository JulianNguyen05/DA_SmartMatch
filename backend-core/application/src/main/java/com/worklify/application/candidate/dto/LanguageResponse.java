package com.worklify.application.candidate.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LanguageResponse {
    private Long id;
    private String languageName;
    private String proficiency;
    private int displayOrder;
}
