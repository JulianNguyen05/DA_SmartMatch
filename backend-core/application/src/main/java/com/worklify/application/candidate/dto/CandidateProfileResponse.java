// CandidateProfileResponse.java
package com.worklify.application.candidate.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class CandidateProfileResponse {
    private Long id;
    private Long userId;
    private String fullName;
    private String avatarUrl;      // MỚI
    private String headline;       // MỚI
    private String phone;
    private String emailContact;   // MỚI
    private String gender;
    private LocalDate dob;
    private String address;
    private String websiteUrl;     // MỚI
    private String linkedinUrl;    // MỚI
    private String githubUrl;      // MỚI
    private String summary;
    private List<String> skills;
    private List<String> skippedSkillSuggestions;
}