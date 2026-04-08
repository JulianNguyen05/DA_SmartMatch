package com.smartmatch.infrastructure.persistence.repository;

import com.smartmatch.domain.job.model.SavedJob;
import com.smartmatch.domain.job.repository.SavedJobRepository;
import com.smartmatch.infrastructure.persistence.jpa.SavedJobJpaEntity;
import com.smartmatch.infrastructure.persistence.mapper.SavedJobMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class SavedJobRepositoryImpl implements SavedJobRepository {

    private final SavedJobJpaRepository jpaRepository;
    private final SavedJobMapper mapper;

    @Override
    public SavedJob save(SavedJob savedJob) {
        SavedJobJpaEntity entity = mapper.toEntity(savedJob);
        SavedJobJpaEntity saved = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public void delete(SavedJob savedJob) {
        jpaRepository.delete(mapper.toEntity(savedJob));
    }

    @Override
    public Optional<SavedJob> findByCandidateIdAndJobId(Long candidateId, Long jobId) {
        return jpaRepository.findByCandidateIdAndJobId(candidateId, jobId)
                .map(mapper::toDomain);
    }

    @Override
    public List<SavedJob> findByCandidateId(Long candidateId) {
        return jpaRepository.findByCandidateIdOrderBySavedAtDesc(candidateId).stream()
                .map(mapper::toDomain)
                .toList();
    }
}