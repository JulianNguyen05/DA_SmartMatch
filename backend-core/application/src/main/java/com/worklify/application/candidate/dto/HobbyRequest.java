package com.worklify.application.candidate.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class HobbyRequest {
    @NotBlank(message = "Tên sở thích không được để trống")
    private String name;
    private int displayOrder;
}
