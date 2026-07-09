package com.worklify.domain.candidate.model;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import java.time.LocalDate;

@Getter
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class Project {
    private Long id;
    private Long candidateId;
    private String projectName;
    private String role;
    private String techStack;
    private String projectUrl;
    private LocalDate startDate;
    private LocalDate endDate;
    private boolean isCurrent;
    private String description;
    private int displayOrder;

    public static Project create(Long candidateId, String projectName) {
        if (candidateId == null || projectName == null || projectName.trim().isEmpty()) {
            throw new IllegalArgumentException("Tên dự án không được để trống.");
        }
        return Project.builder()
                .candidateId(candidateId)
                .projectName(projectName)
                .isCurrent(false)
                .displayOrder(0)
                .build();
    }

    public void updateDetails(String projectName, String role, String techStack, String projectUrl,
                              LocalDate startDate, LocalDate endDate, boolean isCurrent,
                              String description, int displayOrder) {
        if (projectName == null || projectName.trim().isEmpty()) {
            throw new IllegalArgumentException("Tên dự án không được để trống.");
        }
        this.projectName = projectName;
        this.role = role;
        this.techStack = techStack;
        this.projectUrl = projectUrl;
        this.startDate = startDate;
        this.endDate = endDate;
        this.isCurrent = isCurrent;
        this.description = description;
        this.displayOrder = displayOrder;
    }
}