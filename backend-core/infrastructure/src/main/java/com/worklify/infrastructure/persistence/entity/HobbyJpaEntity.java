package com.worklify.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "candidate_hobbies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HobbyJpaEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "candidate_id", nullable = false)
    private Long candidateId;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(name = "display_order")
    private int displayOrder;
}