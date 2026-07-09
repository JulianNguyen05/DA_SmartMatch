package com.worklify.domain.candidate.repository;

import com.worklify.domain.candidate.model.Project;

import java.util.List;
import java.util.Optional;

public interface ProjectRepository {
    Project save(Project education);
    Optional<Project> findById(Long id);
    List<Project> findByCandidateId(Long candidateId);
    void deleteById(Long id);
    void deleteByCandidateId(Long candidateId);
}
