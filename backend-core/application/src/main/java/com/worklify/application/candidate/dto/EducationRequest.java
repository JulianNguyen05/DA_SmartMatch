// EducationRequest.java
package com.worklify.application.candidate.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class EducationRequest {
    @NotBlank(message = "Tên trường học không được để trống")
    private String schoolName;
    private String major;
    private String degree;
    private LocalDate startDate;
    private LocalDate endDate;
    private boolean isCurrent;
    private BigDecimal gpa;
    private String description;
    private int displayOrder;
}