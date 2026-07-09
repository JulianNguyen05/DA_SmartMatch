package com.worklify.infrastructure.persistence.repository;

import com.worklify.infrastructure.persistence.entity.HobbyJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HobbyJpaRepository extends JpaRepository<HobbyJpaEntity, Long> {
    List<HobbyJpaEntity> findByCandidateId(Long candidateId);
    void deleteByCandidateId(Long candidateId);
}