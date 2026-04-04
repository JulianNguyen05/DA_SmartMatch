package com.smartmatch.application.service.candidate;

import com.smartmatch.application.dto.application.ApplyJobRequest;
import com.smartmatch.application.dto.application.JobApplicationResponse;

public interface ApplicationService {
    JobApplicationResponse applyJob(ApplyJobRequest request, Long candidateId);
}