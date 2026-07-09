package com.worklify.infrastructure.persistence.repository;

import com.worklify.infrastructure.persistence.entity.CandidateProfileJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CandidateProfileJpaRepository extends JpaRepository<CandidateProfileJpaEntity, Long> {
    Optional<CandidateProfileJpaEntity> findByUserId(Long userId);

    @Query("SELECT DISTINCT c FROM CandidateProfileJpaEntity c " +
            "LEFT JOIN CandidateSkillJpaEntity cs ON c.id = cs.candidateId " +
            "LEFT JOIN ReferenceValueJpaEntity s ON cs.skillId = s.id AND s.type = 'SKILL' " +
            "WHERE :keyword IS NULL OR :keyword = '' " +
            "OR LOWER(c.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(c.summary) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(s.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<CandidateProfileJpaEntity> searchCandidates(
            @Param("keyword") String keyword,
            Pageable pageable
    );

    Optional<CandidateProfileJpaEntity> findFirstByUserId(Long userId);
}