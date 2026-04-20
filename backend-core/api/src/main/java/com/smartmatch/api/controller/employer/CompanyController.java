package com.smartmatch.api.controller.employer;

import com.smartmatch.application.dto.company.CompanyResponse;
import com.smartmatch.application.dto.company.CreateCompanyRequest;
import com.smartmatch.application.service.employer.CompanyService;
import com.smartmatch.domain.user.model.User;
import com.smartmatch.domain.user.repository.UserRepository; // Import thêm
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/employer/company")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;
    private final UserRepository userRepository; // Tiêm UserRepository

    // Viết một hàm helper nhỏ để lấy ID
    private Long getUserId(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user"))
                .getId();
    }

    @PostMapping
    public ResponseEntity<CompanyResponse> createOrUpdateCompany(
            @Valid @RequestBody CreateCompanyRequest request,
            Authentication authentication) {

        Long ownerId = getUserId(authentication); // Sử dụng hàm helper
        CompanyResponse response = companyService.createOrUpdateCompany(request, ownerId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<CompanyResponse> getMyCompany(Authentication authentication) {
        Long ownerId = getUserId(authentication); // Sử dụng hàm helper
        CompanyResponse response = companyService.getCompanyByOwnerId(ownerId);
        return ResponseEntity.ok(response);
    }
}