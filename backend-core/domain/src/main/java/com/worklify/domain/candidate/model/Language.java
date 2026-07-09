package com.worklify.domain.candidate.model;

import lombok.Builder;
import lombok.Getter;

import java.util.Objects;

@Getter
public class Language {

    private final Long id;
    private final Long candidateId;
    private Long languageId;
    private String proficiency;
    private Integer displayOrder;

    @Builder
    private Language(Long id, Long candidateId, Long languageId, String proficiency, Integer displayOrder) {
        this.id = id;
        this.candidateId = candidateId;
        this.languageId = languageId;
        this.proficiency = proficiency;
        this.displayOrder = displayOrder;
    }

    /** Tạo mới. languageId phải trỏ tới một ReferenceValue(type=LANGUAGE) đã tồn tại. */
    public static Language create(Long candidateId, Long languageId, String proficiency, Integer displayOrder) {
        if (candidateId == null) {
            throw new IllegalArgumentException("candidateId không được null");
        }
        if (languageId == null) {
            throw new IllegalArgumentException(
                    "languageId không được null — phải resolve/tạo ReferenceValue(type=LANGUAGE) trước");
        }
        return new Language(null, candidateId, languageId, proficiency, displayOrder == null ? 0 : displayOrder);
    }

    /** Dựng lại từ persistence. */
    public static Language restore(Long id, Long candidateId, Long languageId, String proficiency, Integer displayOrder) {
        if (id == null) {
            throw new IllegalArgumentException("id không được null khi restore");
        }
        return new Language(id, candidateId, languageId, proficiency, displayOrder);
    }

    public void changeLanguage(Long languageId) {
        if (languageId == null) {
            throw new IllegalArgumentException("languageId không được null");
        }
        this.languageId = languageId;
    }

    public void changeProficiency(String proficiency) {
        this.proficiency = proficiency;
    }

    public void changeDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Language that)) return false;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}