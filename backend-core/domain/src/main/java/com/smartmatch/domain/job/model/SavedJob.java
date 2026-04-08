package com.smartmatch.domain.job.model;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavedJob {
    private Long id;
    private Long candidateId;
    private Long jobId;
    private LocalDateTime savedAt;
}