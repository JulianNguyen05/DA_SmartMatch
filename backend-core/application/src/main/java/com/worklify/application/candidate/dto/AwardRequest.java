package com.worklify.application.candidate.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class AwardRequest {
    @NotBlank(message = "Tên giải thưởng không được để trống")
    private String title;
    private String issuer;
    private LocalDate awardedDate;
    private String description;
    private int displayOrder;
}
