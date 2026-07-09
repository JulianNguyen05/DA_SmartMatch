package com.worklify.infrastructure.persistence.repository;

import com.worklify.infrastructure.persistence.entity.ActivityJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityJpaRepository extends JpaRepository<ActivityJpaEntity, Long> {
    List<ActivityJpaEntity> findByCandidateId(Long candidateId);
    void deleteByCandidateId(Long candidateId);
}