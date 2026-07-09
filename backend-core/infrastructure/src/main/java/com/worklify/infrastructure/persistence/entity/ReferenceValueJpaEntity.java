package com.worklify.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Thay thế hoàn toàn SkillJpaEntity cũ — dùng chung cho mọi loại dữ liệu tham
 * chiếu (SKILL, LANGUAGE, ...). UNIQUE(type, name) khớp với init.sql
 * (uq_type_name).
 */
@Entity
@Table(
        name = "reference_values",
        uniqueConstraints = @UniqueConstraint(name = "uq_type_name", columnNames = {"type", "name"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReferenceValueJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String type;

    @Column(nullable = false, length = 255)
    private String name;
}