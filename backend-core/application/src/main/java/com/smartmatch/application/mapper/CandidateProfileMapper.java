package com.smartmatch.application.mapper;

import com.smartmatch.application.dto.candidate.CandidateProfileRequest;
import com.smartmatch.application.dto.candidate.CandidateProfileResponse;
import com.smartmatch.domain.user.model.CandidateProfile;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component("appCandidateProfileMapper")
public class CandidateProfileMapper {

    public CandidateProfile toDomain(CandidateProfileRequest request, Long candidateId) {
        if (request == null) return null;
        return CandidateProfile.builder()
                .candidateId(candidateId)
                .profileName(request.getProfileName())
                .fullName(request.getFullName())
                .headline(request.getHeadline())
                .sections(request.getSections())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    public CandidateProfileResponse toResponse(CandidateProfile profile) {
        if (profile == null) return null;
        return CandidateProfileResponse.builder()
                .id(profile.getId())
                .profileName(profile.getProfileName())
                .fullName(profile.getFullName())
                .headline(profile.getHeadline())
                .sections(profile.getSections())
                .updatedAt(profile.getUpdatedAt())
                .build();
    }
}