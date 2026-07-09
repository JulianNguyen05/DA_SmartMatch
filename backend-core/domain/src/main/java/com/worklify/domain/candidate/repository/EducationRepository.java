package com.worklify.domain.candidate.repository;

import com.worklify.domain.candidate.model.Education;
import java.util.List;
import java.util.Optional;

public interface EducationRepository {
    Education save(Education education);
    Optional<Education> findById(Long id);
    List<Education> findByCandidateId(Long candidateId);
    void deleteById(Long id);
    void deleteByCandidateId(Long candidateId);
}