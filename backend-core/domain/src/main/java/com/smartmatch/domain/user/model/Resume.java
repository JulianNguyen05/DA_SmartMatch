package com.smartmatch.domain.user.model;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resume {
    private Long id;
    private Long candidateId;
    private String fileName;
    private String fileUrl;             // đường dẫn file (local hoặc S3)
    private String fileType;
    private Long fileSize;
    private LocalDateTime uploadedAt;
}