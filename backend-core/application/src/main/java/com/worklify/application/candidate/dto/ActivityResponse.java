package com.worklify.application.candidate.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class ActivityResponse {
    private Long id;
    private String organization;
    private String role;
    private LocalDate startDate;
    private LocalDate endDate;
    private boolean isCurrent;
    private String description;
    private int displayOrder;
}
