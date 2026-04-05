package com.smartmatch.application.dto.candidate;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CandidateProfileRequest {
    private String fullName;
    private String headline;
    private String summary;
    private String skills;
    private String education;
    private String experience;
}