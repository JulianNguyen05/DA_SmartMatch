// EducationResponse.java
package com.worklify.application.candidate.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class EducationResponse {
    private Long id;
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