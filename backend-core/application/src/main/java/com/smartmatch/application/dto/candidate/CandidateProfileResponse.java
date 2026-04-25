package com.smartmatch.application.dto.candidate;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidateProfileResponse {
    private Long id;
    private String profileName;
    private String fullName;
    private String headline;

    private String sections;

    private LocalDateTime updatedAt;
}