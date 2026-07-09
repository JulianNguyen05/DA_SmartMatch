package com.worklify.domain.candidate.repository;

import com.worklify.domain.candidate.model.Award;

import java.util.List;
import java.util.Optional;

public interface AwardRepository {
    Award save(Award education);
    Optional<Award> findById(Long id);
    List<Award> findByCandidateId(Long candidateId);
    void deleteById(Long id);
    void deleteByCandidateId(Long candidateId);
}
