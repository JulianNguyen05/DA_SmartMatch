package com.smartmatch.domain.user.model;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidateProfile {
    private Long id;
    private Long candidateId;
    private String profileName;
    private String fullName;
    private String headline;
    private String sections;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}