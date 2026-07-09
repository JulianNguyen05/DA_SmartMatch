package com.worklify.domain.candidate.repository;

import com.worklify.domain.candidate.model.Hobby;

import java.util.List;
import java.util.Optional;

public interface HobbyRepository {
    Hobby save(Hobby education);
    Optional<Hobby> findById(Long id);
    List<Hobby> findByCandidateId(Long candidateId);
    void deleteById(Long id);
    void deleteByCandidateId(Long candidateId);
}
