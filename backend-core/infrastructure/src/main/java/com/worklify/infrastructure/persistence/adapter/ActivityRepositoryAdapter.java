package com.worklify.infrastructure.persistence.adapter;

import com.worklify.domain.candidate.model.Activity;
import com.worklify.domain.candidate.repository.ActivityRepository;
import com.worklify.infrastructure.persistence.mapper.CandidateEntityMapper;
import com.worklify.infrastructure.persistence.repository.ActivityJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ActivityRepositoryAdapter implements ActivityRepository {
    private final ActivityJpaRepository jpaRepository;
    private final CandidateEntityMapper mapper;

    @Override
    public Activity save(Activity activity) {
        return mapper.toDomain(jpaRepository.save(mapper.toEntity(activity)));
    }

    @Override
    public Optional<Activity> findById(Long id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<Activity> findByCandidateId(Long candidateId) {
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