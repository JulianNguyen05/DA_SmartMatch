package com.smartmatch.application.service.candidate;

import com.smartmatch.application.dto.application.ApplyJobRequest;
import com.smartmatch.application.dto.application.JobApplicationResponse;

import java.util.List;

public interface ApplicationService {
    JobApplicationResponse applyJob(ApplyJobRequest request, Long candidateId);
    List<JobApplicationResponse> getMyApplications(Long candidateId);
    List<JobApplicationResponse> getApplicationsByJobId(Long jobId, Long employerId);
    void withdrawApplication(Long applicationId, Long candidateId);
}