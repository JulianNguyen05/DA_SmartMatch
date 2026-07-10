package com.worklify.domain.candidate.repository;

import com.worklify.domain.candidate.model.CandidateSkill;
import java.util.List;
import java.util.Optional;

public interface CandidateSkillRepository {
    CandidateSkill save(CandidateSkill candidateSkill);
    List<CandidateSkill> findByCandidateId(Long candidateId);
    Optional<CandidateSkill> findByCandidateIdAndSkillId(Long candidateId, Long skillId);
    void deleteByCandidateIdAndSkillId(Long candidateId, Long skillId);
    void deleteByCandidateId(Long candidateId);
    boolean existsBySkillId(Long skillId);
    List<CandidateSkill> saveAll(List<CandidateSkill> candidateSkills);
}