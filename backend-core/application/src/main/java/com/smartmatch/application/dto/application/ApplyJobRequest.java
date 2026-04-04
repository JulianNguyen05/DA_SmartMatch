package com.smartmatch.application.dto.application;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplyJobRequest {
    private Long jobId;
    private String coverLetter;   // optional
}