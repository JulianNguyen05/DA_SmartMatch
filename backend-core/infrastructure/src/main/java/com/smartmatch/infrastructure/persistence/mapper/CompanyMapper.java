package com.smartmatch.infrastructure.persistence.mapper;

import com.smartmatch.domain.company.model.Company;
import com.smartmatch.infrastructure.persistence.jpa.CompanyJpaEntity;
import org.springframework.stereotype.Component;

@Component
public class CompanyMapper {

    public CompanyJpaEntity toEntity(Company company) {
        if (company == null) return null;
        return CompanyJpaEntity.builder()
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
                .ownerId(company.getOwnerId())
                .build();
    }

    public Company toDomain(CompanyJpaEntity entity) {
        if (entity == null) return null;
        return Company.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .address(entity.getAddress())
                .location(entity.getLocation())
                .website(entity.getWebsite())
                .logoUrl(entity.getLogoUrl())
                .industry(entity.getIndustry())
                .companySize(entity.getCompanySize())
                .createdAt(entity.getCreatedAt())
                .ownerId(entity.getOwnerId())
                .build();
    }
}