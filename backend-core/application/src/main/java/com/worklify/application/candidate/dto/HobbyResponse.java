package com.worklify.application.candidate.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class HobbyResponse {
    private Long id;
    private String name;
    private int displayOrder;
}