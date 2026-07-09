package com.worklify.infrastructure.persistence.repository;

import com.worklify.infrastructure.persistence.entity.CertificationJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CertificationJpaRepository extends JpaRepository<CertificationJpaEntity, Long> {
    List<CertificationJpaEntity> findByCandidateId(Long candidateId);
    void deleteByCandidateId(Long candidateId);
}