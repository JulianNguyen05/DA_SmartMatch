package com.smartmatch.infrastructure.persistence.repository;

import com.smartmatch.infrastructure.persistence.jpa.SavedJobJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavedJobJpaRepository extends JpaRepository<SavedJobJpaEntity, Long> {
    Optional<SavedJobJpaEntity> findByCandidateIdAndJobId(Long candidateId, Long jobId);
    List<SavedJobJpaEntity> findByCandidateIdOrderBySavedAtDesc(Long candidateId);
}