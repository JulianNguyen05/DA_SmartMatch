package com.smartmatch.infrastructure.persistence.mapper;

import com.smartmatch.domain.job.model.SavedJob;
import com.smartmatch.infrastructure.persistence.jpa.SavedJobJpaEntity;
import org.springframework.stereotype.Component;

@Component("jpaSavedJobMapper")
public class SavedJobMapper {

    public SavedJobJpaEntity toEntity(SavedJob savedJob) {
        if (savedJob == null) return null;
        return SavedJobJpaEntity.builder()
                .id(savedJob.getId())
                .candidateId(savedJob.getCandidateId())
                .jobId(savedJob.getJobId())
                .savedAt(savedJob.getSavedAt())
                .build();
    }

    public SavedJob toDomain(SavedJobJpaEntity entity) {
        if (entity == null) return null;
        return SavedJob.builder()
                .id(entity.getId())
                .candidateId(entity.getCandidateId())
                .jobId(entity.getJobId())
                .savedAt(entity.getSavedAt())
                .build();
    }
}