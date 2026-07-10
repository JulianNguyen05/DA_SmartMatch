package com.worklify.application.candidate.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

@Data
public class LayoutPositionItem {
    @NotBlank(message = "blockType không được để trống")
    private String blockType;

    @PositiveOrZero(message = "position không được âm")
    private int position;
}