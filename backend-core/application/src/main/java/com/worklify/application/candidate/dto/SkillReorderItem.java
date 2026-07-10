package com.worklify.application.candidate.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

@Data
public class SkillReorderItem {
    @NotNull(message = "skillId không được để trống")
    private Long skillId;

    @PositiveOrZero(message = "displayOrder không được âm")
    private int displayOrder;
}