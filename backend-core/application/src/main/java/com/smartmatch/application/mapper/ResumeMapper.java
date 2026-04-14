package com.smartmatch.application.mapper;

import com.smartmatch.application.dto.candidate.ResumeResponse;
import com.smartmatch.domain.user.model.Resume;
import org.springframework.stereotype.Component;

@Component("appResumeMapper")
public class ResumeMapper {

    public ResumeResponse toResponse(Resume resume) {
        if (resume == null) return null;
        return ResumeResponse.builder()
                .id(resume.getId())
                .fileName(resume.getFileName())
                .fileUrl(resume.getFileUrl())
                .fileType(resume.getFileType())
                .fileSize(resume.getFileSize())
                .uploadedAt(resume.getUploadedAt())
                .build();
    }
}