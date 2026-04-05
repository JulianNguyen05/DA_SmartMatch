package com.smartmatch.application.mapper;

import com.smartmatch.application.dto.candidate.CandidateProfileRequest;
import com.smartmatch.application.dto.candidate.CandidateProfileResponse;
import com.smartmatch.domain.user.model.CandidateProfile;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class CandidateProfileMapper {

    public CandidateProfile toDomain(CandidateProfileRequest request, Long candidateId) {
        if (request == null) return null;
        return CandidateProfile.builder()
                .candidateId(candidateId)
                .fullName(request.getFullName())
                .headline(request.getHeadline())
                .summary(request.getSummary())
                .skills(request.getSkills())
                .education(request.getEducation())
                .experience(request.getExperience())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    public CandidateProfileResponse toResponse(CandidateProfile profile) {
        if (profile == null) return null;
        return CandidateProfileResponse.builder()
                .id(profile.getId())
                .fullName(profile.getFullName())
                .headline(profile.getHeadline())
                .summary(profile.getSummary())
                .skills(profile.getSkills())
                .education(profile.getEducation())
                .experience(profile.getExperience())
                .updatedAt(profile.getUpdatedAt())
                .build();
    }
}