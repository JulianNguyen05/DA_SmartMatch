package com.smartmatch.domain.application.model;

import com.smartmatch.domain.common.enums.ApplicationStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobApplication {
    private Long id;
    private Long jobId;
    private Long candidateId;      // userId của candidate
    private String coverLetter;    // Thư xin việc (có thể để trống)
    private LocalDateTime appliedAt;
    private ApplicationStatus status;
    private String customAnswers;
}