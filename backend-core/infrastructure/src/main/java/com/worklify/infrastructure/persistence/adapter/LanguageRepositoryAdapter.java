package com.worklify.infrastructure.persistence.adapter;

import com.worklify.domain.candidate.model.Language;
import com.worklify.domain.candidate.repository.LanguageRepository;
import com.worklify.infrastructure.persistence.mapper.CandidateEntityMapper;
import com.worklify.infrastructure.persistence.repository.LanguageJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class LanguageRepositoryAdapter implements LanguageRepository {
    private final LanguageJpaRepository jpaRepository;
    private final CandidateEntityMapper mapper;

    @Override
    public Language save(Language language) {
        return mapper.toDomain(jpaRepository.save(mapper.toEntity(language)));
    }

    @Override
    public Optional<Language> findById(Long id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<Language> findByCandidateId(Long candidateId) {
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