package com.worklify.infrastructure.persistence.repository;

import com.worklify.infrastructure.persistence.entity.ProjectJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectJpaRepository extends JpaRepository<ProjectJpaEntity, Long> {
    List<ProjectJpaEntity> findByCandidateId(Long candidateId);
    void deleteByCandidateId(Long candidateId);
}