package com.smartmatch.domain.user.repository;

import com.smartmatch.domain.user.model.Resume;

import java.util.List;
import java.util.Optional;

public interface ResumeRepository {
    Resume save(Resume resume);
    Optional<Resume> findByCandidateId(Long candidateId);
    List<Resume> findAllByCandidateId(Long candidateId);
}