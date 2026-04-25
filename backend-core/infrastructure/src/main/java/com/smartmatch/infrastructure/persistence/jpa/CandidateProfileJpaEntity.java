package com.smartmatch.infrastructure.persistence.jpa;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "candidate_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidateProfileJpaEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long candidateId;

    private String fullName;
    private String headline;

    @Builder.Default
    @Column(name = "profile_name", nullable = false)
    private String profileName = "Hồ sơ mặc định";

    // Cột lưu các khối nội dung của CV Builder dưới dạng JSON
    @Column(columnDefinition = "json")
    private String sections;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}