package com.smartmatch.infrastructure.persistence.mapper;

import com.smartmatch.domain.user.model.CandidateProfile;
import com.smartmatch.infrastructure.persistence.jpa.CandidateProfileJpaEntity;
import org.springframework.stereotype.Component;

@Component("jpaCandidateProfileMapper")
public class CandidateProfileMapper {
    public CandidateProfileJpaEntity toEntity(CandidateProfile profile) {
        if (profile == null) return null;
        return CandidateProfileJpaEntity.builder()
                .id(profile.getId())
                .candidateId(profile.getCandidateId())
                .profileName(profile.getProfileName())
                .fullName(profile.getFullName())
                .headline(profile.getHeadline())
                .sections(profile.getSections())
                .createdAt(profile.getCreatedAt())
                .updatedAt(profile.getUpdatedAt())
                .build();
    }

    public CandidateProfile toDomain(CandidateProfileJpaEntity entity) {
        if (entity == null) return null;
        return CandidateProfile.builder()
                .id(entity.getId())
                .candidateId(entity.getCandidateId())
                .profileName(entity.getProfileName())
                .fullName(entity.getFullName())
                .headline(entity.getHeadline())
                .sections(entity.getSections())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}