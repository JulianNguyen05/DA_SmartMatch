package com.smartmatch.infrastructure.persistence.repository;

import com.smartmatch.infrastructure.persistence.jpa.ResumeJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResumeJpaRepository extends JpaRepository<ResumeJpaEntity, Long> {

    Optional<ResumeJpaEntity> findByCandidateId(Long candidateId);
    List<ResumeJpaEntity> findAllByCandidateId(Long candidateId);
}