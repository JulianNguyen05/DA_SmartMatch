package com.worklify.domain.referencedata.model;

/**
 * Loại yêu cầu candidate gửi cho admin đối với 1 ReferenceValue (SKILL/LANGUAGE/...).
 * - CREATE: đề xuất thêm giá trị mới (targetReferenceValueId = null)
 * - EDIT:   đề xuất sửa tên 1 giá trị đã tồn tại (targetReferenceValueId trỏ tới giá trị đó)
 * - DELETE: đề xuất xóa 1 giá trị đã tồn tại (targetReferenceValueId trỏ tới giá trị đó)
 */
public enum SuggestionType {
    CREATE,
    EDIT,
    DELETE
}