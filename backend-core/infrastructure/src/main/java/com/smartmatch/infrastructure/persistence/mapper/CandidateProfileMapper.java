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
                .fullName(profile.getFullName())
                .headline(profile.getHeadline())
                .summary(profile.getSummary())
                .skills(profile.getSkills())
                .education(profile.getEducation())
                .experience(profile.getExperience())
                .createdAt(profile.getCreatedAt())
                .updatedAt(profile.getUpdatedAt())
                .build();
    }

    public CandidateProfile toDomain(CandidateProfileJpaEntity entity) {
        if (entity == null) return null;
        return CandidateProfile.builder()
                .id(entity.getId())
                .candidateId(entity.getCandidateId())
                .fullName(entity.getFullName())
                .headline(entity.getHeadline())
                .summary(entity.getSummary())
                .skills(entity.getSkills())
                .education(entity.getEducation())
                .experience(entity.getExperience())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}