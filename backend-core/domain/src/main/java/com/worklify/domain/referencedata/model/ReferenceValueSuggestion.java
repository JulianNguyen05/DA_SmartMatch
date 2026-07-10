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
    private final SuggestionType requestType;
    private final Long targetReferenceValueId;
    private SuggestionStatus status;
    private Long reviewedByAdminId;
    private String reviewNote;
    private final LocalDateTime createdAt;
    private LocalDateTime reviewedAt;

    @Builder
    private ReferenceValueSuggestion(Long id, String type, String name, Long requestedByUserId,
                                     SuggestionType requestType, Long targetReferenceValueId,
                                     SuggestionStatus status, Long reviewedByAdminId, String reviewNote,
                                     LocalDateTime createdAt, LocalDateTime reviewedAt) {
        this.id = id;
        this.type = type;
        this.name = name;
        this.requestedByUserId = requestedByUserId;
        this.requestType = requestType;
        this.targetReferenceValueId = targetReferenceValueId;
        this.status = status;
        this.reviewedByAdminId = reviewedByAdminId;
        this.reviewNote = reviewNote;
        this.createdAt = createdAt;
        this.reviewedAt = reviewedAt;
    }

    /** Đề xuất TẠO MỚI 1 giá trị chưa tồn tại. */
    public static ReferenceValueSuggestion createNew(String type, String name, Long requestedByUserId) {
        validateTypeAndName(type, name);
        requireUserId(requestedByUserId);
        return new ReferenceValueSuggestion(
                null, normalizeType(type), name.trim(), requestedByUserId,
                SuggestionType.CREATE, null,
                SuggestionStatus.PENDING, null, null,
                LocalDateTime.now(), null
        );
    }

    /** Đề xuất SỬA TÊN 1 giá trị đã tồn tại. "name" là tên mới mong muốn. */
    public static ReferenceValueSuggestion createEdit(String type, String name, Long requestedByUserId,
                                                      Long targetReferenceValueId) {
        validateTypeAndName(type, name);
        requireUserId(requestedByUserId);
        if (targetReferenceValueId == null) {
            throw new IllegalArgumentException("targetReferenceValueId không được null khi đề xuất EDIT");
        }
        return new ReferenceValueSuggestion(
                null, normalizeType(type), name.trim(), requestedByUserId,
                SuggestionType.EDIT, targetReferenceValueId,
                SuggestionStatus.PENDING, null, null,
                LocalDateTime.now(), null
        );
    }

    /** Đề xuất XÓA 1 giá trị đã tồn tại. "name" lưu lại tên hiện tại để admin đối chiếu khi duyệt. */
    public static ReferenceValueSuggestion createDelete(String type, String name, Long requestedByUserId,
                                                        Long targetReferenceValueId) {
        validateTypeAndName(type, name);
        requireUserId(requestedByUserId);
        if (targetReferenceValueId == null) {
            throw new IllegalArgumentException("targetReferenceValueId không được null khi đề xuất DELETE");
        }
        return new ReferenceValueSuggestion(
                null, normalizeType(type), name.trim(), requestedByUserId,
                SuggestionType.DELETE, targetReferenceValueId,
                SuggestionStatus.PENDING, null, null,
                LocalDateTime.now(), null
        );
    }

    /** Dựng lại từ persistence. */
    public static ReferenceValueSuggestion restore(Long id, String type, String name, Long requestedByUserId,
                                                   SuggestionType requestType, Long targetReferenceValueId,
                                                   SuggestionStatus status, Long reviewedByAdminId,
                                                   String reviewNote, LocalDateTime createdAt,
                                                   LocalDateTime reviewedAt) {
        return new ReferenceValueSuggestion(id, type, name, requestedByUserId, requestType, targetReferenceValueId,
                status, reviewedByAdminId, reviewNote, createdAt, reviewedAt);
    }

    /**
     * Admin duyệt đề xuất — CHỈ chuyển trạng thái, KHÔNG còn tự tạo ReferenceValue nữa
     * (khác bản cũ). Vì giờ có 3 loại request khác nhau (CREATE/EDIT/DELETE) với hệ quả
     * khác nhau lên ReferenceValue, việc thực thi hệ quả đó thuộc về tầng Application
     * (nơi có quyền truy cập ReferenceValueRepository), giữ domain aggregate này gọn.
     *
     * [BREAKING CHANGE so với bản cũ] approve() trước đây trả về ReferenceValue, giờ trả về void.
     * Nơi gọi (AdminServiceImpl) cần cập nhật lại theo hướng dẫn ở snippet tiến độ 5.
     */
    public void approve(Long adminId) {
        ensurePending();
        if (adminId == null) {
            throw new IllegalArgumentException("adminId không được null");
        }
        this.status = SuggestionStatus.APPROVED;
        this.reviewedByAdminId = adminId;
        this.reviewedAt = LocalDateTime.now();
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

    private static void validateTypeAndName(String type, String name) {
        if (type == null || type.isBlank()) {
            throw new IllegalArgumentException("type không được để trống");
        }
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("name không được để trống");
        }
    }

    private static void requireUserId(Long requestedByUserId) {
        if (requestedByUserId == null) {
            throw new IllegalArgumentException("requestedByUserId không được null");
        }
    }

    private static String normalizeType(String type) {
        return type.trim().toUpperCase();
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