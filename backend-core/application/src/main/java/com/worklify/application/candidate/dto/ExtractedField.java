package com.worklify.application.candidate.dto;

import lombok.Data;

@Data
public class ExtractedField {
    private String value;
    private double confidence;
    private String source; // "RULE_BASED" | "NER_MODEL"
}