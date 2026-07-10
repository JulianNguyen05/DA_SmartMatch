package com.worklify.application.candidate.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class SkillReorderRequest {
    @NotEmpty(message = "Danh sách skill không được để trống")
    @Valid
    private List<SkillReorderItem> items;
}