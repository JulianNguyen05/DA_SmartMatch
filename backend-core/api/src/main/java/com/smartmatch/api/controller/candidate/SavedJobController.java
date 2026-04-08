package com.smartmatch.api.controller.candidate;

import com.smartmatch.application.dto.job.SavedJobResponse;
import com.smartmatch.application.service.candidate.SavedJobService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/candidate/saved-jobs")
@RequiredArgsConstructor
public class SavedJobController {

    private final SavedJobService savedJobService;

    // POST /api/candidate/saved-jobs/{jobId}/toggle
    // Dùng chung cho cả việc Lưu và Bỏ lưu (tiện cho nút Tim/Bookmark trên UI)
    @PostMapping("/{jobId}/toggle")
    public ResponseEntity<Void> toggleSaveJob(
            @PathVariable Long jobId,
            Authentication authentication) {

        Long candidateId = Long.parseLong(authentication.getName());
        savedJobService.toggleSaveJob(jobId, candidateId);
        return ResponseEntity.ok().build();
    }

    // GET /api/candidate/saved-jobs
    @GetMapping
    public ResponseEntity<List<SavedJobResponse>> getMySavedJobs(Authentication authentication) {
        Long candidateId = Long.parseLong(authentication.getName());
        List<SavedJobResponse> responses = savedJobService.getMySavedJobs(candidateId);
        return ResponseEntity.ok(responses);
    }
}