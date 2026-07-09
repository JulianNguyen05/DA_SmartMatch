package com.worklify.domain.candidate.repository;


import com.worklify.domain.candidate.model.Certification;

import java.util.List;
import java.util.Optional;

public interface CertificationRepository {
    Certification save(Certification education);
    Optional<Certification> findById(Long id);
    List<Certification> findByCandidateId(Long candidateId);
    void deleteById(Long id);
    void deleteByCandidateId(Long candidateId);
}