package com.worklify.infrastructure.persistence.repository;

import com.worklify.infrastructure.persistence.entity.EducationJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EducationJpaRepository extends JpaRepository<EducationJpaEntity, Long> {
    List<EducationJpaEntity> findByCandidateId(Long candidateId);
    void deleteByCandidateId(Long candidateId);
}