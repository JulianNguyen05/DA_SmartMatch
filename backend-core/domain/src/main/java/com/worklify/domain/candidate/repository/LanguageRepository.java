package com.worklify.domain.candidate.repository;

import com.worklify.domain.candidate.model.Language;

import java.util.List;
import java.util.Optional;

public interface LanguageRepository {
    Language save(Language education);
    Optional<Language> findById(Long id);
    List<Language> findByCandidateId(Long candidateId);
    void deleteById(Long id);
    void deleteByCandidateId(Long candidateId);
}
