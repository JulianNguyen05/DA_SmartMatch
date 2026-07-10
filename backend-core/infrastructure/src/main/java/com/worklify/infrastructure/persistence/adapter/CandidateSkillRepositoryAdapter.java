package com.worklify.infrastructure.persistence.adapter;

import com.worklify.domain.candidate.model.CandidateSkill;
import com.worklify.domain.candidate.repository.CandidateSkillRepository;
import com.worklify.infrastructure.persistence.entity.CandidateSkillJpaEntity;
import com.worklify.infrastructure.persistence.mapper.CandidateEntityMapper;
import com.worklify.infrastructure.persistence.repository.CandidateSkillJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class CandidateSkillRepositoryAdapter implements CandidateSkillRepository {
    private final CandidateSkillJpaRepository jpaRepository;
    private final CandidateEntityMapper mapper;

    @Override
    public CandidateSkill save(CandidateSkill candidateSkill) {
        return mapper.toDomain(jpaRepository.save(mapper.toEntity(candidateSkill)));
    }

    @Override
    public List<CandidateSkill> findByCandidateId(Long candidateId) {
        return jpaRepository.findByCandidateId(candidateId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<CandidateSkill> findByCandidateIdAndSkillId(Long candidateId, Long skillId) {
        return jpaRepository.findByCandidateIdAndSkillId(candidateId, skillId)
                .map(mapper::toDomain);
    }

    @Override
    public void deleteByCandidateIdAndSkillId(Long candidateId, Long skillId) {
        jpaRepository.deleteByCandidateIdAndSkillId(candidateId, skillId);
    }

    @Override
    public void deleteByCandidateId(Long candidateId) {
        jpaRepository.deleteByCandidateId(candidateId);
    }

    @Override
    public boolean existsBySkillId(Long skillId) {
        return jpaRepository.existsBySkillId(skillId);
    }

    @Override
    public List<CandidateSkill> saveAll(List<CandidateSkill> candidateSkills) {
        List<CandidateSkillJpaEntity> entities = candidateSkills.stream()
                .map(mapper::toEntity)
                .collect(Collectors.toList());
        return jpaRepository.saveAll(entities).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }
}