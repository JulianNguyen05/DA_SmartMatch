package com.smartmatch.infrastructure.persistence.jpa;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "saved_jobs", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"candidateId", "jobId"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavedJobJpaEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long candidateId;

    @Column(nullable = false)
    private Long jobId;

    private LocalDateTime savedAt;
}