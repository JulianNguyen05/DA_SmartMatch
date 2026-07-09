package com.worklify.application.candidate.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class CertificationResponse {
    private Long id;
    private String name;
    private String issuingOrg;
    private LocalDate issueDate;
    private LocalDate expiryDate;
    private String credentialId;
    private String credentialUrl;
    private int displayOrder;
}
