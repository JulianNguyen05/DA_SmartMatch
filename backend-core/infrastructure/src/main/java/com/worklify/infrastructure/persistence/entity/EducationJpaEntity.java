package com.worklify.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "candidate_educations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EducationJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "candidate_id", nullable = false)
    private Long candidateId;

    @Column(name = "school_name", nullable = false, length = 255)
    private String schoolName;

    @Column(length = 255)
    private String major;

    @Column(length = 100)
    private String degree;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "is_current")
    private boolean isCurrent;

    @Column(precision = 3, scale = 2)
    private BigDecimal gpa;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "display_order")
    private int displayOrder;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}