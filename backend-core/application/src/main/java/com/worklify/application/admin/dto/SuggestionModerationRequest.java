package com.worklify.application.admin.dto;

import lombok.Data;

/**
 * Thay thế MasterDataRequest cũ (vốn chỉ dùng cho tạo Skill). Dùng cho flow
 * duyệt/từ chối ReferenceValueSuggestion tổng quát (áp dụng cho mọi type).
 */
@Data
public class SuggestionModerationRequest {
    /** Chỉ dùng khi từ chối — lý do từ chối để candidate biết. */
    private String reviewNote;
}