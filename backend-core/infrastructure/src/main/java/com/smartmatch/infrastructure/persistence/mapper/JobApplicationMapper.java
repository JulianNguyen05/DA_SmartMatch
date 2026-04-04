package com.smartmatch.infrastructure.persistence.mapper;

import com.smartmatch.domain.application.model.JobApplication;
import com.smartmatch.infrastructure.persistence.jpa.JobApplicationJpaEntity;
import org.springframework.stereotype.Component;

@Component("jpaJobApplicationMapper")
public class JobApplicationMapper {

    public JobApplicationJpaEntity toEntity(JobApplication app) {
        if (app == null) return null;
        return JobApplicationJpaEntity.builder()
                .id(app.getId())
                .jobId(app.getJobId())
                .candidateId(app.getCandidateId())
                .coverLetter(app.getCoverLetter())
                .appliedAt(app.getAppliedAt())
                .status(app.getStatus())
                .build();
    }

    public JobApplication toDomain(JobApplicationJpaEntity entity) {
        if (entity == null) return null;
        return JobApplication.builder()
                .id(entity.getId())
                .jobId(entity.getJobId())
                .candidateId(entity.getCandidateId())
                .coverLetter(entity.getCoverLetter())
                .appliedAt(entity.getAppliedAt())
                .status(entity.getStatus())
                .build();
    }
}