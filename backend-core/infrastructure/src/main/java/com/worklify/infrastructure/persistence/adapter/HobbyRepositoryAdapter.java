package com.worklify.infrastructure.persistence.adapter;

import com.worklify.domain.candidate.model.Hobby;
import com.worklify.domain.candidate.repository.HobbyRepository;
import com.worklify.infrastructure.persistence.mapper.CandidateEntityMapper;
import com.worklify.infrastructure.persistence.repository.HobbyJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class HobbyRepositoryAdapter implements HobbyRepository {
    private final HobbyJpaRepository jpaRepository;
    private final CandidateEntityMapper mapper;

    @Override
    public Hobby save(Hobby hobby) {
        return mapper.toDomain(jpaRepository.save(mapper.toEntity(hobby)));
    }

    @Override
    public Optional<Hobby> findById(Long id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<Hobby> findByCandidateId(Long candidateId) {
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