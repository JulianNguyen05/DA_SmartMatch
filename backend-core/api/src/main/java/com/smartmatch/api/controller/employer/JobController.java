package com.smartmatch.api.controller.employer;

import com.smartmatch.application.dto.job.CreateJobRequest;
import com.smartmatch.application.dto.job.JobResponse;
import com.smartmatch.application.service.employer.JobService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/employer/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;

    @PostMapping
    public ResponseEntity<JobResponse> createJob(
            @RequestBody CreateJobRequest request,
            Authentication authentication) {

        // Lấy employerId từ JWT (sẽ hoàn thiện sau khi Auth ổn)
        Long employerId = Long.parseLong(authentication.getName()); // tạm dùng username = id, bạn có thể thay bằng CustomUserDetails

        JobResponse response = jobService.createJob(request, employerId);
        return ResponseEntity.ok(response);
    }
}