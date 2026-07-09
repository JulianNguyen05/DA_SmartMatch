package com.worklify.domain.candidate.repository;

import com.worklify.domain.candidate.model.Experience;

import java.util.List;
import java.util.Optional;

public interface ExperienceRepository {
    Experience save(Experience education);
    Optional<Experience> findById(Long id);
    List<Experience> findByCandidateId(Long candidateId);
    void deleteById(Long id);
    void deleteByCandidateId(Long candidateId);
}