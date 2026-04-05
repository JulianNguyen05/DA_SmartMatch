package com.smartmatch.api.controller.publics;

import com.smartmatch.application.dto.job.JobResponse;
import com.smartmatch.application.service.employer.JobService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public/jobs")
@RequiredArgsConstructor
public class PublicJobController {

    private final JobService jobService;

    /**
     * Xem tất cả tin tuyển dụng đang công khai (Published)
     */
    @GetMapping
    public ResponseEntity<List<JobResponse>> getAllPublishedJobs() {
        List<JobResponse> jobs = jobService.getAllPublishedJobs();
        return ResponseEntity.ok(jobs);
    }

    /**
     * Xem chi tiết một tin tuyển dụng công khai
     */
    @GetMapping("/{id}")
    public ResponseEntity<JobResponse> getPublicJobById(@PathVariable Long id) {
        JobResponse job = jobService.getPublicJobById(id);
        return ResponseEntity.ok(job);
    }
}