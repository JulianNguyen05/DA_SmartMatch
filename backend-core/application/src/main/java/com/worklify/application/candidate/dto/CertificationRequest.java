package com.worklify.application.candidate.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CertificationRequest {
    @NotBlank(message = "Tên chứng chỉ không được để trống")
    private String name;
    private String issuingOrg;
    private LocalDate issueDate;
    private LocalDate expiryDate;
    private String credentialId;
    private String credentialUrl;
    private int displayOrder;
}
