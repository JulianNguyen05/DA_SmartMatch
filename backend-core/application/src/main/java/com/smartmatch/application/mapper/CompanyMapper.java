package com.smartmatch.application.mapper;

import com.smartmatch.application.dto.company.CompanyResponse;
import com.smartmatch.application.dto.company.CreateCompanyRequest;
import com.smartmatch.domain.company.model.Company;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class CompanyMapper {

    public Company toDomain(CreateCompanyRequest request, Long ownerId) {
        if (request == null) return null;
        return Company.builder()
                .name(request.getName())
                .description(request.getDescription())
                .address(request.getAddress())
                .location(request.getLocation())
                .website(request.getWebsite())
                .logoUrl(request.getLogoUrl())
                .industry(request.getIndustry())
                .companySize(request.getCompanySize())
                .ownerId(ownerId)
                .createdAt(LocalDateTime.now())
                .build();
    }

    public CompanyResponse toResponse(Company company) {
        if (company == null) return null;
        return CompanyResponse.builder()
                .id(company.getId())
                .name(company.getName())
                .description(company.getDescription())
                .address(company.getAddress())
                .location(company.getLocation())
                .website(company.getWebsite())
                .logoUrl(company.getLogoUrl())
                .industry(company.getIndustry())
                .companySize(company.getCompanySize())
                .createdAt(company.getCreatedAt())
                .build();
    }
}