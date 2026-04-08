package com.smartmatch.application.service.employer;

import com.smartmatch.application.dto.job.CreateJobRequest;
import com.smartmatch.application.dto.job.JobResponse;
import com.smartmatch.application.dto.job.JobSearchRequest;

import java.util.List;

public interface JobService {
    JobResponse createJob(CreateJobRequest request, Long employerId);
    List<JobResponse> getMyJobs(Long employerId);
    JobResponse getJobById(Long jobId, Long employerId);
    List<JobResponse> getAllPublishedJobs();
    JobResponse getPublicJobById(Long id);
    List<JobResponse> searchPublishedJobs(JobSearchRequest request);
}