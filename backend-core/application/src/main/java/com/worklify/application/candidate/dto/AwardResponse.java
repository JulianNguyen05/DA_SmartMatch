package com.worklify.application.candidate.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class AwardResponse {
    private Long id;
    private String title;
    private String issuer;
    private LocalDate awardedDate;
    private String description;
    private int displayOrder;
}
