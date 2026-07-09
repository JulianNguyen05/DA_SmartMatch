package com.worklify.application.referencedata.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SuggestionRequest {
    @NotBlank(message = "type không được để trống")
    private String type;

    @NotBlank(message = "Tên đề xuất không được để trống")
    private String name;
}