package com.worklify.infrastructure.persistence.entity;

import com.worklify.domain.referencedata.model.SuggestionStatus;
import com.worklify.domain.referencedata.model.SuggestionType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Map bảng reference_value_suggestions. Tái sử dụng trực tiếp domain enum
 * SuggestionStatus và SuggestionType (giống cách UserJpaEntity dùng domain.auth.model.Role).
 */
@Entity
@Table(name = "reference_value_suggestions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReferenceValueSuggestionJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String type;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(name = "requested_by_user_id", nullable = false)
    private Long requestedByUserId;

    @Enumerated(EnumType.STRING)
    @Column(name = "request_type", nullable = false, length = 20)
    private SuggestionType requestType;

    @Column(name = "target_reference_value_id")
    private Long targetReferenceValueId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SuggestionStatus status;

    @Column(name = "reviewed_by_admin_id")
    private Long reviewedByAdminId;

    @Column(name = "review_note", length = 500)
    private String reviewNote;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;
}