package com.worklify.domain.candidate.model;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import java.time.LocalDate;

@Getter
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class Experience {
    private Long id;
    private Long candidateId;
    private String companyName;
    private String position;
    private String employmentType; // FULL_TIME, PART_TIME, INTERNSHIP, FREELANCE
    private String location;
    private LocalDate startDate;
    private LocalDate endDate;
    private boolean isCurrent;
    private String description;
    private int displayOrder;

    public static Experience create(Long candidateId, String companyName) {
        if (candidateId == null || companyName == null || companyName.trim().isEmpty()) {
            throw new IllegalArgumentException("Tên công ty không được để trống.");
        }
        return Experience.builder()
                .candidateId(candidateId)
                .companyName(companyName)
                .isCurrent(false)
                .displayOrder(0)
                .build();
    }

    public void updateDetails(String companyName, String position, String employmentType,
                              String location, LocalDate startDate, LocalDate endDate,
                              boolean isCurrent, String description, int displayOrder) {
        if (companyName == null || companyName.trim().isEmpty()) {
            throw new IllegalArgumentException("Tên công ty không được để trống.");
        }
        this.companyName = companyName;
        this.position = position;
        this.employmentType = employmentType;
        this.location = location;
        this.startDate = startDate;
        this.endDate = endDate;
        this.isCurrent = isCurrent;
        this.description = description;
        this.displayOrder = displayOrder;
    }
}