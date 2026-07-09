package com.worklify.application.candidate.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class ProjectResponse {
    private Long id;
    private String projectName;
    private String role;
    private String techStack;
    private String projectUrl;
    private LocalDate startDate;
    private LocalDate endDate;
    private boolean isCurrent;
    private String description;
    private int displayOrder;
}
