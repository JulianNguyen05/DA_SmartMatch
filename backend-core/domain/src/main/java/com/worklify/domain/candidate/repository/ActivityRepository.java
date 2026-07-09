package com.worklify.domain.candidate.repository;

import com.worklify.domain.candidate.model.Activity;

import java.util.List;
import java.util.Optional;

public interface ActivityRepository {
    Activity save(Activity education);
    Optional<Activity> findById(Long id);
    List<Activity> findByCandidateId(Long candidateId);
    void deleteById(Long id);
    void deleteByCandidateId(Long candidateId);
}
