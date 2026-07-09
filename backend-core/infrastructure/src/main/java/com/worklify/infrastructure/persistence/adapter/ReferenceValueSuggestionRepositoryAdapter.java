package com.worklify.infrastructure.persistence.adapter;

import com.worklify.domain.referencedata.model.ReferenceValueSuggestion;
import com.worklify.domain.referencedata.model.SuggestionStatus;
import com.worklify.domain.referencedata.repository.ReferenceValueSuggestionRepository;
import com.worklify.infrastructure.persistence.mapper.ReferenceDataEntityMapper;
import com.worklify.infrastructure.persistence.repository.ReferenceValueSuggestionJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ReferenceValueSuggestionRepositoryAdapter implements ReferenceValueSuggestionRepository {

    private final ReferenceValueSuggestionJpaRepository jpaRepository;
    private final ReferenceDataEntityMapper mapper;

    @Override
    public ReferenceValueSuggestion save(ReferenceValueSuggestion suggestion) {
        return mapper.toDomain(jpaRepository.save(mapper.toEntity(suggestion)));
    }

    @Override
    public Optional<ReferenceValueSuggestion> findById(Long id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<ReferenceValueSuggestion> findByStatus(SuggestionStatus status) {
        return jpaRepository.findByStatus(status).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<ReferenceValueSuggestion> findByType(String type) {
        return jpaRepository.findByType(type).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }
}