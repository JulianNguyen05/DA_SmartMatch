package com.worklify.infrastructure.persistence.repository;

import com.worklify.infrastructure.persistence.entity.LanguageJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LanguageJpaRepository extends JpaRepository<LanguageJpaEntity, Long> {
    List<LanguageJpaEntity> findByCandidateId(Long candidateId);
    void deleteByCandidateId(Long candidateId);
    boolean existsByLanguageId(Long languageId);
}