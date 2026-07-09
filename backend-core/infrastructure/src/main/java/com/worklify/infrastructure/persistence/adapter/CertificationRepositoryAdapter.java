package com.worklify.infrastructure.persistence.adapter;

import com.worklify.domain.candidate.model.Certification;
import com.worklify.domain.candidate.repository.CertificationRepository;
import com.worklify.infrastructure.persistence.mapper.CandidateEntityMapper;
import com.worklify.infrastructure.persistence.repository.CertificationJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class CertificationRepositoryAdapter implements CertificationRepository {
    private final CertificationJpaRepository jpaRepository;
    private final CandidateEntityMapper mapper;

    @Override
    public Certification save(Certification certification) {
        return mapper.toDomain(jpaRepository.save(mapper.toEntity(certification)));
    }

    @Override
    public Optional<Certification> findById(Long id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<Certification> findByCandidateId(Long candidateId) {
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