// Hobby.java
package com.worklify.domain.candidate.model;

import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class Hobby {
    private Long id;
    private Long candidateId;
    private String name;
    private int displayOrder;

    public static Hobby create(Long candidateId, String name) {
        if (candidateId == null || name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Tên sở thích không được để trống.");
        }
        return Hobby.builder().candidateId(candidateId).name(name).displayOrder(0).build();
    }

    public void updateDetails(String name, int displayOrder) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Tên sở thích không được để trống.");
        }
        this.name = name;
        this.displayOrder = displayOrder;
    }
}