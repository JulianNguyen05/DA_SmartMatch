package com.worklify.infrastructure.persistence.repository;

import com.worklify.infrastructure.persistence.entity.ExperienceJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExperienceJpaRepository extends JpaRepository<ExperienceJpaEntity, Long> {
    List<ExperienceJpaEntity> findByCandidateId(Long candidateId);
    void deleteByCandidateId(Long candidateId);
}