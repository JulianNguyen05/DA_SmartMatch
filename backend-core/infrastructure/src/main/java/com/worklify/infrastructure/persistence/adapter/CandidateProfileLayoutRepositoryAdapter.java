package com.worklify.infrastructure.persistence.adapter;

import com.worklify.domain.candidate.model.CandidateProfileLayout;
import com.worklify.domain.candidate.repository.CandidateProfileLayoutRepository;
import com.worklify.infrastructure.persistence.mapper.CandidateEntityMapper;
import com.worklify.infrastructure.persistence.repository.CandidateProfileLayoutJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class CandidateProfileLayoutRepositoryAdapter implements CandidateProfileLayoutRepository {

    private final CandidateProfileLayoutJpaRepository jpaRepository;
    private final CandidateEntityMapper mapper;

    @Override
    public List<CandidateProfileLayout> findByCandidateId(Long candidateId) {
        return jpaRepository.findByCandidateId(candidateId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public boolean existsByCandidateId(Long candidateId) {
        return jpaRepository.existsByCandidateId(candidateId);
    }

    @Override
    public List<CandidateProfileLayout> saveAll(List<CandidateProfileLayout> layouts) {
        List<CandidateProfileLayout> saved = jpaRepository.saveAll(
                layouts.stream().map(mapper::toEntity).collect(Collectors.toList())
        ).stream().map(mapper::toDomain).collect(Collectors.toList());
        return saved;
    }
}