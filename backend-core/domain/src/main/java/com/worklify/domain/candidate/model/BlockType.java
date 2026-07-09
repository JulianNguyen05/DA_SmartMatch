// BlockType.java
package com.worklify.domain.candidate.model;

/**
 * Các loại block hiển thị trên trang ProfilePage của candidate.
 * - Block đơn (singleton): PERSONAL_INFO, AVATAR, SOCIAL_LINKS
 * - Block danh sách (repeatable, đã có displayOrder riêng cho từng item):
 *   ACTIVITY, AWARD, SKILL, CERTIFICATION, EDUCATION, EXPERIENCE, HOBBY, LANGUAGE, PROJECT
 *
 * Lưu ý: CvDocument KHÔNG nằm trong danh sách này — CV thuộc CV Builder,
 * không phải một block cấu hình trên ProfilePage.
 */
public enum BlockType {
    PERSONAL_INFO(false),
    AVATAR(false),
    SOCIAL_LINKS(false),
    ACTIVITY(true),
    AWARD(true),
    SKILL(true),
    CERTIFICATION(true),
    EDUCATION(true),
    EXPERIENCE(true),
    HOBBY(true),
    LANGUAGE(true),
    PROJECT(true);

    private final boolean repeatable;

    BlockType(boolean repeatable) {
        this.repeatable = repeatable;
    }

    /** true nếu block chứa danh sách nhiều item (có thể kéo-thả sắp xếp item bên trong). */
    public boolean isRepeatable() {
        return repeatable;
    }
}