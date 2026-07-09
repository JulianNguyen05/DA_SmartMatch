package com.worklify.infrastructure.persistence.adapter;

import com.worklify.domain.candidate.model.Education;
import com.worklify.domain.candidate.repository.EducationRepository;
import com.worklify.infrastructure.persistence.mapper.CandidateEntityMapper;
import com.worklify.infrastructure.persistence.repository.EducationJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class EducationRepositoryAdapter implements EducationRepository {
    private final EducationJpaRepository jpaRepository;
    private final CandidateEntityMapper mapper;

    @Override
    public Education save(Education education) {
        return mapper.toDomain(jpaRepository.save(mapper.toEntity(education)));
    }

    @Override
    public Optional<Education> findById(Long id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<Education> findByCandidateId(Long candidateId) {
        return jpaRepository.findByCandidateId(candidateId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteById(Long id) {
        jpaRepository.deleteById(id);
    }

    @Override
    public void deleteByCandidateId(Long candidateId) {
        jpaRepository.deleteByCandidateId(candidateId);
    }
}