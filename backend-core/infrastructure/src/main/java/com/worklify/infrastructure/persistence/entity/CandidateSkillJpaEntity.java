package com.worklify.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "candidate_skills")
@IdClass(CandidateSkillId.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidateSkillJpaEntity {

    @Id
    @Column(name = "candidate_id", nullable = false)
    private Long candidateId;

    @Id
    @Column(name = "skill_id", nullable = false)
    private Long skillId;

    @Column(name = "level", length = 50)
    private String level;

    @Column(name = "years_of_ex")
    private Integer yearsOfEx;

    @Column(name = "note", length = 255)
    private String note;

    @Column(name = "display_order")
    private int displayOrder;
}