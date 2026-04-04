package com.smartmatch.infrastructure.persistence.repository;

import com.smartmatch.domain.job.model.Job;
import com.smartmatch.domain.job.repository.JobRepository;
import com.smartmatch.infrastructure.persistence.jpa.JobJpaEntity;
import com.smartmatch.infrastructure.persistence.mapper.JobMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class JobRepositoryImpl implements JobRepository {

    private final JobJpaRepository jpaRepository;
    private final JobMapper mapper;

    @Override
    public Job save(Job job) {
        JobJpaEntity entity = mapper.toEntity(job);
        JobJpaEntity saved = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<Job> findById(Long id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<Job> findByCompanyId(Long companyId) {
        return jpaRepository.findByCompanyId(companyId).stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public List<Job> findAllPublished() {
        return jpaRepository.findByStatus("PUBLISHED").stream()
                .map(mapper::toDomain)
                .toList();
    }
}