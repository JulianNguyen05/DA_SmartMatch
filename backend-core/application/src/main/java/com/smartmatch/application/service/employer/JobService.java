// backend-core/application/src/main/java/com/smartmatch/application/service/employer/JobService.java
package com.smartmatch.application.service.employer;

import com.smartmatch.application.dto.PageResponse;
import com.smartmatch.application.dto.job.CreateJobRequest;
import com.smartmatch.application.dto.job.JobResponse;
import com.smartmatch.application.dto.job.JobSearchRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface JobService {
    JobResponse createJob(CreateJobRequest request, Long employerId);
    List<JobResponse> getMyJobs(Long employerId);
    JobResponse getJobById(Long jobId, Long employerId);
    List<JobResponse> getAllPublishedJobs();
    JobResponse getPublicJobById(Long id);
    List<JobResponse> searchPublishedJobs(JobSearchRequest request);
    PageResponse<JobResponse> searchPublishedJobs(JobSearchRequest request, Pageable pageable);
    JobResponse updateJob(CreateJobRequest request, Long jobId, Long employerId);
    void deleteJob(Long jobId, Long employerId);
}