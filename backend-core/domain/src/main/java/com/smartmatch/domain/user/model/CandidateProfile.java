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
    private Long candidateId;           // userId
    private String fullName;
    private String headline;            // ví dụ: "Senior Java Developer"
    private String summary;             // giới thiệu bản thân
    private String skills;              // "Java, Spring Boot, MySQL" (có thể dùng List<String> sau)
    private String education;
    private String experience;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}