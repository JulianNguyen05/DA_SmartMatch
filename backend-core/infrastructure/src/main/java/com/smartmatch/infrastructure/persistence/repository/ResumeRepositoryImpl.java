package com.smartmatch.infrastructure.persistence.repository;

import com.smartmatch.domain.user.model.Resume;
import com.smartmatch.domain.user.repository.ResumeRepository;
import com.smartmatch.infrastructure.persistence.jpa.ResumeJpaEntity;
import com.smartmatch.infrastructure.persistence.mapper.ResumeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class ResumeRepositoryImpl implements ResumeRepository {

    private final ResumeJpaRepository jpaRepository;
    private final ResumeMapper mapper;

    @Override
    public Resume save(Resume resume) {
        ResumeJpaEntity entity = mapper.toEntity(resume);
        ResumeJpaEntity saved = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<Resume> findByCandidateId(Long candidateId) {
        return jpaRepository.findByCandidateId(candidateId)
                .map(mapper::toDomain);
    }

    @Override
    public List<Resume> findAllByCandidateId(Long candidateId) {
        return jpaRepository.findAllByCandidateId(candidateId).stream()
                .map(mapper::toDomain)
                .toList();
    }
    @Override
    public Optional<Resume> findById(Long id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public void deleteById(Long id) {
        jpaRepository.deleteById(id);
    }
}