package com.smartmatch.api.controller.publics;

import com.smartmatch.application.dto.company.CompanyResponse;
import com.smartmatch.application.service.employer.CompanyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/companies")
@RequiredArgsConstructor
public class PublicCompanyController {

    private final CompanyService companyService;

    @GetMapping("/{id}")
    public ResponseEntity<CompanyResponse> getCompanyById(@PathVariable Long id) {
        return ResponseEntity.ok(companyService.getCompanyById(id));
    }
}