package com.smartmatch.api.controller.publics;

import com.smartmatch.application.dto.PageResponse;
import com.smartmatch.application.dto.job.JobResponse;
import com.smartmatch.application.dto.job.JobSearchRequest;
import com.smartmatch.application.service.employer.JobService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
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

    /**
     * TÌM KIẾM & LỌC tin tuyển dụng (tính năng cốt lõi)
     * Ví dụ: GET /api/public/jobs/search?keyword=java&location=TP.HCM&jobType=FULL_TIME&minSalary=15000000
     */
    @GetMapping("/search")
    public ResponseEntity<List<JobResponse>> searchJobs(@ModelAttribute JobSearchRequest request) {
        List<JobResponse> jobs = jobService.searchPublishedJobs(request);
        return ResponseEntity.ok(jobs);
    }

    @GetMapping("/search")
    public ResponseEntity<PageResponse<JobResponse>> searchJobs(
            @ModelAttribute JobSearchRequest request,
            @PageableDefault(size = 20, sort = "postedAt", direction = org.springframework.data.domain.Sort.Direction.DESC) Pageable pageable) {

        PageResponse<JobResponse> page = jobService.searchPublishedJobs(request, pageable);
        return ResponseEntity.ok(page);
    }
}