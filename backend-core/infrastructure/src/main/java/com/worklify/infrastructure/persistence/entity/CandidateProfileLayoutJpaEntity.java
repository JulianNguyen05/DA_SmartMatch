package com.worklify.infrastructure.persistence.entity;

import com.worklify.domain.candidate.model.BlockType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "candidate_profile_layouts",
        uniqueConstraints = @UniqueConstraint(name = "uq_candidate_block", columnNames = {"candidate_id", "block_type"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidateProfileLayoutJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "candidate_id", nullable = false)
    private Long candidateId;

    @Enumerated(EnumType.STRING)
    @Column(name = "block_type", nullable = false, length = 50)
    private BlockType blockType;

    @Column(name = "position", nullable = false)
    private int position;

    @Column(name = "visible", nullable = false)
    private boolean visible;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}