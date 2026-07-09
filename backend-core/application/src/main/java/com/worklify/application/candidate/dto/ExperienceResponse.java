package com.worklify.application.candidate.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class ExperienceResponse {
    private Long id;
    private String companyName;
    private String position;
    private String employmentType;
    private String location;
    private LocalDate startDate;
    private LocalDate endDate;
    private boolean isCurrent;
    private String description;
    private int displayOrder;
}
