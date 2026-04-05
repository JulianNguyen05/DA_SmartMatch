package com.smartmatch.infrastructure.persistence.repository;

import com.smartmatch.domain.user.model.CandidateProfile;
import com.smartmatch.domain.user.repository.CandidateProfileRepository;
import com.smartmatch.infrastructure.persistence.jpa.CandidateProfileJpaEntity;
import com.smartmatch.infrastructure.persistence.mapper.CandidateProfileMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class CandidateProfileRepositoryImpl implements CandidateProfileRepository {

    private final CandidateProfileJpaRepository jpaRepository;
    private final CandidateProfileMapper mapper;

    @Override
    public CandidateProfile save(CandidateProfile profile) {
        CandidateProfileJpaEntity entity = mapper.toEntity(profile);

        if (entity.getCreatedAt() == null) {
            entity.setCreatedAt(LocalDateTime.now());
        }
        entity.setUpdatedAt(LocalDateTime.now());

        CandidateProfileJpaEntity saved = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<CandidateProfile> findByCandidateId(Long candidateId) {
        return jpaRepository.findByCandidateId(candidateId)
                .map(mapper::toDomain);
    }
}