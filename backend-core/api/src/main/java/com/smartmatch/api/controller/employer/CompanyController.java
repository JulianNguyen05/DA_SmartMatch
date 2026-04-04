package com.smartmatch.api.controller.employer;

import com.smartmatch.application.dto.company.CompanyResponse;
import com.smartmatch.application.dto.company.CreateCompanyRequest;
import com.smartmatch.application.service.employer.CompanyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/employer/company")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;

    @PostMapping
    public ResponseEntity<CompanyResponse> createOrUpdateCompany(
            @RequestBody CreateCompanyRequest request,
            Authentication authentication) {

        Long ownerId = Long.parseLong(authentication.getName()); // tạm thời, sau sẽ lấy từ CustomUserDetails
        CompanyResponse response = companyService.createOrUpdateCompany(request, ownerId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<CompanyResponse> getMyCompany(Authentication authentication) {
        Long ownerId = Long.parseLong(authentication.getName());
        CompanyResponse response = companyService.getCompanyByOwnerId(ownerId);
        return ResponseEntity.ok(response);
    }
}