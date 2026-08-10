package com.worklify.application.candidate.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class ParsedSkillItem {
    private String name;

    @JsonProperty("matched_skill_id")
    private Long matchedSkillId;

    private double confidence;
}