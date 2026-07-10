package com.worklify.infrastructure.persistence.repository;

import com.worklify.infrastructure.persistence.entity.CandidateProfileLayoutJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CandidateProfileLayoutJpaRepository extends JpaRepository<CandidateProfileLayoutJpaEntity, Long> {
    List<CandidateProfileLayoutJpaEntity> findByCandidateId(Long candidateId);
    boolean existsByCandidateId(Long candidateId);
}