package com.worklify.domain.candidate.model;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import java.time.LocalDate;

@Getter
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class Certification {
    private Long id;
    private Long candidateId;
    private String name;
    private String issuingOrg;
    private LocalDate issueDate;
    private LocalDate expiryDate;
    private String credentialId;
    private String credentialUrl;
    private int displayOrder;

    public static Certification create(Long candidateId, String name) {
        if (candidateId == null || name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Tên chứng chỉ không được để trống.");
        }
        return Certification.builder()
                .candidateId(candidateId)
                .name(name)
                .displayOrder(0)
                .build();
    }

    public void updateDetails(String name, String issuingOrg, LocalDate issueDate, LocalDate expiryDate,
                              String credentialId, String credentialUrl, int displayOrder) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Tên chứng chỉ không được để trống.");
        }
        this.name = name;
        this.issuingOrg = issuingOrg;
        this.issueDate = issueDate;
        this.expiryDate = expiryDate;
        this.credentialId = credentialId;
        this.credentialUrl = credentialUrl;
        this.displayOrder = displayOrder;
    }
}