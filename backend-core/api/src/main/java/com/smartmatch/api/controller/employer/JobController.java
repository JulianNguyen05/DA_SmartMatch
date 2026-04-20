// backend-core/api/src/main/java/com/smartmatch/api/controller/employer/JobController.java
package com.smartmatch.api.controller.employer;

import com.smartmatch.application.dto.application.JobApplicationResponse;
import com.smartmatch.application.dto.job.CreateJobRequest;
import com.smartmatch.application.dto.job.JobResponse;
import com.smartmatch.application.service.candidate.ApplicationService;
import com.smartmatch.application.service.employer.JobService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employer/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;
    private final ApplicationService applicationService;

    @PostMapping
    public ResponseEntity<JobResponse> createJob(
            @Valid @RequestBody CreateJobRequest request,
            Authentication authentication) {

        Long employerId = Long.parseLong(authentication.getName());
        JobResponse response = jobService.createJob(request, employerId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my")
    public ResponseEntity<List<JobResponse>> getMyJobs(Authentication authentication) {
        Long employerId = Long.parseLong(authentication.getName());
        List<JobResponse> jobs = jobService.getMyJobs(employerId);
        return ResponseEntity.ok(jobs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobResponse> getJobById(
            @PathVariable Long id,
            Authentication authentication) {

        Long employerId = Long.parseLong(authentication.getName());
        JobResponse job = jobService.getJobById(id, employerId);
        return ResponseEntity.ok(job);
    }

    @GetMapping("/{jobId}/applications")
    public ResponseEntity<List<JobApplicationResponse>> getJobApplications(
            @PathVariable Long jobId,
            Authentication authentication) {

        Long employerId = Long.parseLong(authentication.getName());
        List<JobApplicationResponse> applications = applicationService.getApplicationsByJobId(jobId, employerId);
        return ResponseEntity.ok(applications);
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobResponse> updateJob(
            @PathVariable Long id,
            @Valid @RequestBody CreateJobRequest request,
            Authentication authentication) {

        Long employerId = Long.parseLong(authentication.getName());
        JobResponse response = jobService.updateJob(request, id, employerId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJob(
            @PathVariable Long id,
            Authentication authentication) {

        Long employerId = Long.parseLong(authentication.getName());
        jobService.deleteJob(id, employerId);
        return ResponseEntity.noContent().build();
    }
}