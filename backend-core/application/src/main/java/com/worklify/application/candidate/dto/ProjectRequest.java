package com.worklify.application.candidate.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ProjectRequest {
    @NotBlank(message = "Tên dự án không được để trống")
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
