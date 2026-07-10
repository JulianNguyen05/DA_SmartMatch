package com.worklify.application.candidate.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class ProfileLayoutReorderRequest {
    @NotEmpty(message = "Danh sách block không được để trống")
    @Valid
    private List<LayoutPositionItem> items;
}