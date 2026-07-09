// Activity.java
package com.worklify.domain.candidate.model;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import java.time.LocalDate;

@Getter
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class Activity {
    private Long id;
    private Long candidateId;
    private String organization;
    private String role;
    private LocalDate startDate;
    private LocalDate endDate;
    private boolean isCurrent;
    private String description;
    private int displayOrder;

    public static Activity create(Long candidateId, String organization) {
        if (candidateId == null || organization == null || organization.trim().isEmpty()) {
            throw new IllegalArgumentException("Tên tổ chức không được để trống.");
        }
        return Activity.builder().candidateId(candidateId).organization(organization)
                .isCurrent(false).displayOrder(0).build();
    }

    public void updateDetails(String organization, String role, LocalDate startDate, LocalDate endDate,
                              boolean isCurrent, String description, int displayOrder) {
        if (organization == null || organization.trim().isEmpty()) {
            throw new IllegalArgumentException("Tên tổ chức không được để trống.");
        }
        this.organization = organization;
        this.role = role;
        this.startDate = startDate;
        this.endDate = endDate;
        this.isCurrent = isCurrent;
        this.description = description;
        this.displayOrder = displayOrder;
    }
}