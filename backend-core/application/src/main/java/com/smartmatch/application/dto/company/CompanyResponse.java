package com.smartmatch.application.dto.company;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyResponse {
    private Long id;
    private String name;
    private String description;
    private String address;
    private String location;
    private String website;
    private String logoUrl;
    private String industry;
    private String companySize;
    private LocalDateTime createdAt;
}