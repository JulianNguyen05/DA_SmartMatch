package com.smartmatch.infrastructure.persistence.repository;

import com.smartmatch.infrastructure.persistence.jpa.JobApplicationJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobApplicationJpaRepository extends JpaRepository<JobApplicationJpaEntity, Long> {
    boolean existsByJobIdAndCandidateId(Long jobId, Long candidateId);
    List<JobApplicationJpaEntity> findByJobId(Long jobId);
    List<JobApplicationJpaEntity> findByCandidateId(Long candidateId);
    Optional<JobApplicationJpaEntity> findByJobIdAndCandidateId(Long jobId, Long candidateId);
}