package com.smartmatch.application.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank @Email
    private String email;

    @NotBlank
    private String password;

    @NotBlank
    private String phone;

    private String role; // "EMPLOYER" hoặc "CANDIDATE" (Admin sẽ tạo riêng)
}