package com.worklify.application.candidate.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LanguageRequest {
    @NotBlank(message = "Tên ngoại ngữ không được để trống")
    private String languageName;
    private String proficiency;
    private int displayOrder;
}
