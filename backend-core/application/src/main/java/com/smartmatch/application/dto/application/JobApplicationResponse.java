package com.smartmatch.application.dto.application;

import com.smartmatch.domain.common.enums.ApplicationStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobApplicationResponse {
    private Long id;
    private Long jobId;
    private Long candidateId;
    private String coverLetter;
    private LocalDateTime appliedAt;
    private ApplicationStatus status;
    private String customAnswers;
}