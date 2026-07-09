package com.worklify.domain.referencedata.model;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.Objects;

@Getter
public class ReferenceValueSuggestion {

    private final Long id;
    private final String type;
    private final String name;
    private final Long requestedByUserId;
    private SuggestionStatus status;
    private Long reviewedByAdminId;
    private String reviewNote;
    private final LocalDateTime createdAt;
    private LocalDateTime reviewedAt;

    @Builder
    private ReferenceValueSuggestion(Long id, String type, String name, Long requestedByUserId,
                                     SuggestionStatus status, Long reviewedByAdminId, String reviewNote,
                                     LocalDateTime createdAt, LocalDateTime reviewedAt) {
        this.id = id;
        this.type = type;
        this.name = name;
        this.requestedByUserId = requestedByUserId;
        this.status = status;
        this.reviewedByAdminId = reviewedByAdminId;
        this.reviewNote = reviewNote;
        this.createdAt = createdAt;
        this.reviewedAt = reviewedAt;
    }

    /** Tạo mới một đề xuất, mặc định status = PENDING. */
    public static ReferenceValueSuggestion create(String type, String name, Long requestedByUserId) {
        if (type == null || type.isBlank()) {
            throw new IllegalArgumentException("type không được để trống");
        }
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("name không được để trống");
        }
        if (requestedByUserId == null) {
            throw new IllegalArgumentException("requestedByUserId không được null");
        }
        return new ReferenceValueSuggestion(
                null, type.trim().toUpperCase(), name.trim(), requestedByUserId,
                SuggestionStatus.PENDING, null, null,
                LocalDateTime.now(), null
        );
    }

    /** Dựng lại từ persistence. */
    public static ReferenceValueSuggestion restore(Long id, String type, String name, Long requestedByUserId,
                                                   SuggestionStatus status, Long reviewedByAdminId,
                                                   String reviewNote, LocalDateTime createdAt,
                                                   LocalDateTime reviewedAt) {
        return new ReferenceValueSuggestion(id, type, name, requestedByUserId, status,
                reviewedByAdminId, reviewNote, createdAt, reviewedAt);
    }

    /**
     * Admin duyệt đề xuất. Trả về một ReferenceValue mới (chưa persist) để tầng
     * Application lưu vào bảng reference_values.
     */
    public ReferenceValue approve(Long adminId) {
        ensurePending();
        if (adminId == null) {
            throw new IllegalArgumentException("adminId không được null");
        }
        this.status = SuggestionStatus.APPROVED;
        this.reviewedByAdminId = adminId;
        this.reviewedAt = LocalDateTime.now();
        return ReferenceValue.create(this.type, this.name);
    }

    /** Admin từ chối đề xuất, có thể kèm ghi chú lý do. */
    public void reject(Long adminId, String note) {
        ensurePending();
        if (adminId == null) {
            throw new IllegalArgumentException("adminId không được null");
        }
        this.status = SuggestionStatus.REJECTED;
        this.reviewedByAdminId = adminId;
        this.reviewNote = note;
        this.reviewedAt = LocalDateTime.now();
    }

    private void ensurePending() {
        if (this.status != SuggestionStatus.PENDING) {
            throw new IllegalStateException(
                    "Suggestion id=" + id + " đã được xử lý (status=" + status + "), không thể duyệt/từ chối lại");
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ReferenceValueSuggestion that)) return false;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}