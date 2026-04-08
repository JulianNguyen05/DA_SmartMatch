package com.smartmatch.application.service.employer;

import com.smartmatch.application.dto.company.CompanyResponse;
import com.smartmatch.application.dto.company.CreateCompanyRequest;

public interface CompanyService {
    CompanyResponse createOrUpdateCompany(CreateCompanyRequest request, Long ownerId);
    CompanyResponse getCompanyByOwnerId(Long ownerId);
    CompanyResponse getCompanyById(Long id);
}