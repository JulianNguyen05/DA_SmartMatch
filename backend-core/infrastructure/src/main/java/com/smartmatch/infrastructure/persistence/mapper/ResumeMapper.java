package com.smartmatch.infrastructure.persistence.mapper;

import com.smartmatch.domain.user.model.Resume;
import com.smartmatch.infrastructure.persistence.jpa.ResumeJpaEntity;
import org.springframework.stereotype.Component;

@Component
public class ResumeMapper {
    public ResumeJpaEntity toEntity(Resume resume) {
        if (resume == null) return null;
        return ResumeJpaEntity.builder()
                .id(resume.getId())
                .candidateId(resume.getCandidateId())
                .fileName(resume.getFileName())
                .fileUrl(resume.getFileUrl())
                .fileType(resume.getFileType())
                .fileSize(resume.getFileSize())
                .uploadedAt(resume.getUploadedAt())
                .build();
    }

    public Resume toDomain(ResumeJpaEntity entity) {
        if (entity == null) return null;
        return Resume.builder()
                .id(entity.getId())
                .candidateId(entity.getCandidateId())
                .fileName(entity.getFileName())
                .fileUrl(entity.getFileUrl())
                .fileType(entity.getFileType())
                .fileSize(entity.getFileSize())
                .uploadedAt(entity.getUploadedAt())
                .build();
    }
}