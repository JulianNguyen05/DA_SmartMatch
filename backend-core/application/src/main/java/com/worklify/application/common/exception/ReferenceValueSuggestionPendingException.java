package com.worklify.application.common.exception;

/**
 * Ném ra khi candidate nhập một skill/language chưa tồn tại trong
 * reference_values. Hệ thống đã tự tạo ReferenceValueSuggestion(status=PENDING)
 * nhưng KHÔNG gán vào candidate_skills/candidate_languages vì chưa có id hợp lệ.
 * Controller nên map exception này sang HTTP 202 Accepted hoặc 409 Conflict
 * kèm message để FE báo cho candidate biết đang chờ duyệt.
 */
public class ReferenceValueSuggestionPendingException extends RuntimeException {

    public ReferenceValueSuggestionPendingException(String message) {
        super(message);
    }
}