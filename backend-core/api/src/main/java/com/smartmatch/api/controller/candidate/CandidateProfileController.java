package com.smartmatch.api.controller.candidate;

import com.smartmatch.application.dto.candidate.CandidateProfileRequest;
import com.smartmatch.application.dto.candidate.CandidateProfileResponse;
import com.smartmatch.application.service.candidate.CandidateProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/candidate/profile")
@RequiredArgsConstructor
public class CandidateProfileController {

    private final CandidateProfileService profileService;

    @PostMapping
    public ResponseEntity<CandidateProfileResponse> saveProfile(
            @Valid @RequestBody CandidateProfileRequest request,
            Authentication authentication) {

        Long candidateId = Long.parseLong(authentication.getName());
        CandidateProfileResponse response = profileService.saveOrUpdate(request, candidateId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<CandidateProfileResponse> getMyProfile(Authentication authentication) {
        Long candidateId = Long.parseLong(authentication.getName());
        CandidateProfileResponse response = profileService.getMyProfile(candidateId);
        return ResponseEntity.ok(response);
    }
}