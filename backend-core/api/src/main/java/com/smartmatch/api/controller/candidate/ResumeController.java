package com.smartmatch.api.controller.candidate;

import com.smartmatch.application.dto.candidate.ResumeResponse;
import com.smartmatch.application.service.candidate.ResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/candidate/resumes")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeService resumeService;

    @PostMapping("/upload")
    public ResponseEntity<ResumeResponse> uploadResume(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) throws IOException {

        Long candidateId = Long.parseLong(authentication.getName());
        ResumeResponse response = resumeService.uploadResume(file, candidateId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my")
    public ResponseEntity<List<ResumeResponse>> getMyResumes(Authentication authentication) {
        Long candidateId = Long.parseLong(authentication.getName());
        List<ResumeResponse> responses = resumeService.getMyResumes(candidateId);
        return ResponseEntity.ok(responses);
    }
}