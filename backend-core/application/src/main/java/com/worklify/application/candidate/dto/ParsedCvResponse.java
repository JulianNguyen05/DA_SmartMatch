package com.worklify.application.candidate.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

/**
 * Khớp 1:1 với ParsedCvResponse (pydantic) bên backend-ml
 * (app/schemas/parser_schema.py) — field names giữ nguyên snake_case
 * qua @JsonProperty để deserialize thẳng từ response của
 * POST {ML_BASE_URL}/parser/extract, không cần mapper riêng.
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ParsedCvResponse {

    @JsonProperty("raw_text")
    private String rawText;

    private ContactInfoDto contact;

    @JsonProperty("full_name")
    private ExtractedField fullName;

    private ExtractedField location;

    private List<ParsedEducationItem> educations;
    private List<ParsedExperienceItem> experiences;
    private List<ParsedSkillItem> skills;

    @JsonProperty("summary_text")
    private String summaryText;

    private List<String> warnings;
}