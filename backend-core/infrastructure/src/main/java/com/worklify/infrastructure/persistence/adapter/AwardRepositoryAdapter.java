package com.worklify.infrastructure.persistence.adapter;

import com.worklify.domain.candidate.model.Award;
import com.worklify.domain.candidate.repository.AwardRepository;
import com.worklify.infrastructure.persistence.mapper.CandidateEntityMapper;
import com.worklify.infrastructure.persistence.repository.AwardJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class AwardRepositoryAdapter implements AwardRepository {
    private final AwardJpaRepository jpaRepository;
    private final CandidateEntityMapper mapper;

    @Override
    public Award save(Award award) {
        return mapper.toDomain(jpaRepository.save(mapper.toEntity(award)));
    }

    @Override
    public Optional<Award> findById(Long id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<Award> findByCandidateId(Long candidateId) {
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