package com.worklify.infrastructure.persistence.repository;

import com.worklify.infrastructure.persistence.entity.CandidateSkillJpaEntity;
import com.worklify.infrastructure.persistence.entity.CandidateSkillId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CandidateSkillJpaRepository extends JpaRepository<CandidateSkillJpaEntity, CandidateSkillId> {
    List<CandidateSkillJpaEntity> findByCandidateId(Long candidateId);
    Optional<CandidateSkillJpaEntity> findByCandidateIdAndSkillId(Long candidateId, Long skillId);
    void deleteByCandidateIdAndSkillId(Long candidateId, Long skillId);
    void deleteByCandidateId(Long candidateId);
    boolean existsBySkillId(Long skillId);
}