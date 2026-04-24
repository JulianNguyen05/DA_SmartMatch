package com.smartmatch.application.mapper;

import com.smartmatch.application.dto.application.ApplyJobRequest;
import com.smartmatch.application.dto.application.JobApplicationResponse;
import com.smartmatch.domain.application.model.JobApplication;
import com.smartmatch.domain.common.enums.ApplicationStatus;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component("appJobApplicationMapper")
public class JobApplicationMapper {

    public JobApplication toDomain(ApplyJobRequest request, Long candidateId) {
        if (request == null) return null;
        return JobApplication.builder()
                .jobId(request.getJobId())
                .candidateId(candidateId)
                .coverLetter(request.getCoverLetter())
                .appliedAt(LocalDateTime.now())
                .status(ApplicationStatus.PENDING)
                .customAnswers(request.getCustomAnswers())
                .build();
    }

    public JobApplicationResponse toResponse(JobApplication app) {
        if (app == null) return null;
        return JobApplicationResponse.builder()
                .id(app.getId())
                .jobId(app.getJobId())
                .candidateId(app.getCandidateId())
                .coverLetter(app.getCoverLetter())
                .appliedAt(app.getAppliedAt())
                .status(app.getStatus())
                .customAnswers(app.getCustomAnswers())
                .build();
    }
}