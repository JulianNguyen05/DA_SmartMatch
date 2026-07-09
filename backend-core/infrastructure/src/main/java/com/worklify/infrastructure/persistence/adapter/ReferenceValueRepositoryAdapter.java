package com.worklify.infrastructure.persistence.adapter;

import com.worklify.domain.referencedata.model.ReferenceValue;
import com.worklify.domain.referencedata.repository.ReferenceValueRepository;
import com.worklify.infrastructure.persistence.mapper.ReferenceDataEntityMapper;
import com.worklify.infrastructure.persistence.repository.ReferenceValueJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ReferenceValueRepositoryAdapter implements ReferenceValueRepository {

    private final ReferenceValueJpaRepository jpaRepository;
    private final ReferenceDataEntityMapper mapper;

    @Override
    public Optional<ReferenceValue> findById(Long id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public Optional<ReferenceValue> findByTypeAndNameIgnoreCase(String type, String name) {
        return jpaRepository.findByTypeAndNameIgnoreCase(type, name).map(mapper::toDomain);
    }

    @Override
    public List<ReferenceValue> searchByTypeAndKeyword(String type, String keyword) {
        return jpaRepository.findByTypeAndNameContainingIgnoreCase(type, keyword).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public ReferenceValue save(ReferenceValue referenceValue) {
        return mapper.toDomain(jpaRepository.save(mapper.toEntity(referenceValue)));
    }

    @Override
    public void deleteById(Long id) {
        jpaRepository.deleteById(id);
    }
}