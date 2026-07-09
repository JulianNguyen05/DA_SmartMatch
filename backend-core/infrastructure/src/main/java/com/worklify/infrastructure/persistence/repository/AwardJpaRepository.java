package com.worklify.infrastructure.persistence.repository;

import com.worklify.infrastructure.persistence.entity.AwardJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AwardJpaRepository extends JpaRepository<AwardJpaEntity, Long> {
    List<AwardJpaEntity> findByCandidateId(Long candidateId);
    void deleteByCandidateId(Long candidateId);
}