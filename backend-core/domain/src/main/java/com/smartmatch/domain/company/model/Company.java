package com.smartmatch.domain.company.model;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Company {
    private Long id;
    private String name;
    private String description;
    private String address;
    private String location;          // Nha Trang, TP.HCM...
    private String website;
    private String logoUrl;
    private String industry;          // CNTT, Tài chính, Sản xuất...
    private String companySize;       // "10-50", "51-200"...
    private LocalDateTime createdAt;
    private Long ownerId;             // userId của employer
}