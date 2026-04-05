package com.smartmatch.infrastructure.persistence.repository;

import com.smartmatch.infrastructure.persistence.jpa.CandidateProfileJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CandidateProfileJpaRepository extends JpaRepository<CandidateProfileJpaEntity, Long> {

    Optional<CandidateProfileJpaEntity> findByCandidateId(Long candidateId);
}