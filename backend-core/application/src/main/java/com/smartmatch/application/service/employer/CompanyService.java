package com.smartmatch.application.service.employer;

import com.smartmatch.application.dto.company.CompanyResponse;
import com.smartmatch.application.dto.company.CreateCompanyRequest;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface CompanyService {
    CompanyResponse createOrUpdateCompany(CreateCompanyRequest request, Long ownerId);
    CompanyResponse getCompanyByOwnerId(Long ownerId);
    CompanyResponse getCompanyById(Long id);
    String uploadLogo(MultipartFile file, Long ownerId) throws IOException;
}