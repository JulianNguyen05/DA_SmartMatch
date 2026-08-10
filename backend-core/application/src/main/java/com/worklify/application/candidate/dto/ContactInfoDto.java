package com.worklify.application.candidate.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class ContactInfoDto {
    private ExtractedField email;
    private ExtractedField phone;

    @JsonProperty("linkedin_url")
    private ExtractedField linkedinUrl;

    @JsonProperty("github_url")
    private ExtractedField githubUrl;

    @JsonProperty("website_url")
    private ExtractedField websiteUrl;
}