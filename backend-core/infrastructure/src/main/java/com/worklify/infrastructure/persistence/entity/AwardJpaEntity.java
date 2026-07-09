package com.worklify.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "candidate_awards")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AwardJpaEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "candidate_id", nullable = false)
    private Long candidateId;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(length = 255)
    private String issuer;

    @Column(name = "awarded_date")
    private LocalDate awardedDate;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "display_order")
    private int displayOrder;
}