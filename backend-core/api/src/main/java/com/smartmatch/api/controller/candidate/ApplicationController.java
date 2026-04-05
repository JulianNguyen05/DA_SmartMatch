package com.smartmatch.api.controller.candidate;

import com.smartmatch.application.dto.application.ApplyJobRequest;
import com.smartmatch.application.dto.application.JobApplicationResponse;
import com.smartmatch.application.service.candidate.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/candidate/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    @PostMapping
    public ResponseEntity<JobApplicationResponse> applyJob(
            @RequestBody ApplyJobRequest request,
            Authentication authentication) {

        Long candidateId = Long.parseLong(authentication.getName());
        JobApplicationResponse response = applicationService.applyJob(request, candidateId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my")
    public ResponseEntity<List<JobApplicationResponse>> getMyApplications(Authentication authentication) {
        Long candidateId = Long.parseLong(authentication.getName());
        List<JobApplicationResponse> applications = applicationService.getMyApplications(candidateId);
        return ResponseEntity.ok(applications);
    }
}