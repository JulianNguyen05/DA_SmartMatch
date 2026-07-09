// CandidateProfileRequest.java
package com.worklify.application.candidate.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDate;

@Data
public class CandidateProfileRequest {
    @NotBlank(message = "Họ tên không được để trống")
    private String fullName;
    private String headline;       // MỚI
    private String phone;
    private String emailContact;   // MỚI
    private String gender;
    private LocalDate dob;
    private String address;
    private String websiteUrl;     // MỚI
    private String linkedinUrl;    // MỚI
    private String githubUrl;      // MỚI
    private String summary;
    private String skills;
}