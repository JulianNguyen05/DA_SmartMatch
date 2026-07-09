package com.worklify.domain.candidate.model;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class Education {
    private Long id;
    private Long candidateId;
    private String schoolName;
    private String major;
    private String degree; // Trung cấp, Cao đẳng, Đại học, Thạc sĩ, Tiến sĩ
    private LocalDate startDate;
    private LocalDate endDate;
    private boolean isCurrent;
    private BigDecimal gpa;
    private String description;
    private int displayOrder;

    public static Education create(Long candidateId, String schoolName) {
        if (candidateId == null || schoolName == null || schoolName.trim().isEmpty()) {
            throw new IllegalArgumentException("Tên trường học không được để trống.");
        }
        return Education.builder()
                .candidateId(candidateId)
                .schoolName(schoolName)
                .isCurrent(false)
                .displayOrder(0)
                .build();
    }

    public void updateDetails(String schoolName, String major, String degree,
                              LocalDate startDate, LocalDate endDate, boolean isCurrent,
                              BigDecimal gpa, String description, int displayOrder) {
        if (schoolName == null || schoolName.trim().isEmpty()) {
            throw new IllegalArgumentException("Tên trường học không được để trống.");
        }
        this.schoolName = schoolName;
        this.major = major;
        this.degree = degree;
        this.startDate = startDate;
        this.endDate = endDate;
        this.isCurrent = isCurrent;
        this.gpa = gpa;
        this.description = description;
        this.displayOrder = displayOrder;
    }
}