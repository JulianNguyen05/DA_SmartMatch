package com.worklify.application.candidate.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CandidateSkillResponse {
    private Long id;           // skillId trong bảng reference_values
    private String skillName;
    private String level;
    private Integer yearsOfEx;
    private String description; // Ánh xạ từ cột note
    private int displayOrder;
}