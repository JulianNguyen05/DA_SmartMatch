// Language.java
package com.worklify.domain.candidate.model;

import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class Language {
    private Long id;
    private Long candidateId;
    private String languageName;
    private String proficiency; // Cơ bản, Trung cấp, Thành thạo, Bản ngữ (hoặc A1-C2)
    private int displayOrder;

    public static Language create(Long candidateId, String languageName) {
        if (candidateId == null || languageName == null || languageName.trim().isEmpty()) {
            throw new IllegalArgumentException("Tên ngôn ngữ không được để trống.");
        }
        return Language.builder().candidateId(candidateId).languageName(languageName).displayOrder(0).build();
    }

    public void updateDetails(String languageName, String proficiency, int displayOrder) {
        if (languageName == null || languageName.trim().isEmpty()) {
            throw new IllegalArgumentException("Tên ngôn ngữ không được để trống.");
        }
        this.languageName = languageName;
        this.proficiency = proficiency;
        this.displayOrder = displayOrder;
    }

}