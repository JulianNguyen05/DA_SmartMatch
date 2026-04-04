package com.smartmatch.application.dto.company;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateCompanyRequest {
    private String name;
    private String description;
    private String address;
    private String location;
    private String website;
    private String logoUrl;
    private String industry;
    private String companySize;
}