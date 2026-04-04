package com.smartmatch.infrastructure.persistence.repository;

import com.smartmatch.domain.application.model.JobApplication;
import com.smartmatch.domain.application.repository.JobApplicationRepository;
import com.smartmatch.infrastructure.persistence.jpa.JobApplicationJpaEntity;
import com.smartmatch.infrastructure.persistence.mapper.JobApplicationMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class JobApplicationRepositoryImpl implements JobApplicationRepository {

    private final JobApplicationJpaRepository jpaRepository;
    private final JobApplicationMapper mapper;

    @Override
    public JobApplication save(JobApplication application) {
        JobApplicationJpaEntity entity = mapper.toEntity(application);
        JobApplicationJpaEntity saved = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<JobApplication> findById(Long id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public boolean existsByJobIdAndCandidateId(Long jobId, Long candidateId) {
        return jpaRepository.existsByJobIdAndCandidateId(jobId, candidateId);
    }

    @Override
    public List<JobApplication> findByJobId(Long jobId) {
        return jpaRepository.findByJobId(jobId).stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public List<JobApplication> findByCandidateId(Long candidateId) {
        return jpaRepository.findByCandidateId(candidateId).stream()
                .map(mapper::toDomain)
                .toList();
    }
}