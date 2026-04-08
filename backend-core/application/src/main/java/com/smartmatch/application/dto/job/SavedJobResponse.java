package com.smartmatch.application.dto.job;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavedJobResponse {
    private Long id;
    private Long jobId;
    private JobResponse jobDetails; // Nhúng thông tin job vào để FE dễ hiển thị
    private LocalDateTime savedAt;
}