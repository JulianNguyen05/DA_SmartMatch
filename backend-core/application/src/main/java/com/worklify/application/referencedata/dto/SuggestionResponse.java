package com.worklify.application.referencedata.dto;

import com.worklify.domain.referencedata.model.SuggestionStatus;
import com.worklify.domain.referencedata.model.SuggestionType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class SuggestionResponse {
    private Long id;
    private String type;
    private String name;
    private Long requestedByUserId;
    private SuggestionType requestType;
    private Long targetReferenceValueId;
    private SuggestionStatus status;
    private Long reviewedByAdminId;
    private String reviewNote;
    private LocalDateTime createdAt;
    private LocalDateTime reviewedAt;
}