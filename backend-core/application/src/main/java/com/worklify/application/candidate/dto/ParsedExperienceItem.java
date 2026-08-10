package com.worklify.application.candidate.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class ParsedExperienceItem {
    @JsonProperty("job_title")
    private ExtractedField jobTitle;

    private ExtractedField company;

    @JsonProperty("start_date")
    private ExtractedField startDate;

    @JsonProperty("end_date")
    private ExtractedField endDate;

    @JsonProperty("raw_text")
    private String rawText;
}