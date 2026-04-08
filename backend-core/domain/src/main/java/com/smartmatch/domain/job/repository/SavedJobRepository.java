package com.smartmatch.domain.job.repository;

import com.smartmatch.domain.job.model.SavedJob;

import java.util.List;
import java.util.Optional;

public interface SavedJobRepository {
    SavedJob save(SavedJob savedJob);
    void delete(SavedJob savedJob);
    Optional<SavedJob> findByCandidateIdAndJobId(Long candidateId, Long jobId);
    List<SavedJob> findByCandidateId(Long candidateId);
}