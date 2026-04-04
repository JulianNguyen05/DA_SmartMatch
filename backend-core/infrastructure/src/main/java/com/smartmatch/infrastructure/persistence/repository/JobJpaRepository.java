package com.smartmatch.infrastructure.persistence.repository;

import com.smartmatch.infrastructure.persistence.jpa.JobJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobJpaRepository extends JpaRepository<JobJpaEntity, Long> {
    List<JobJpaEntity> findByCompanyId(Long companyId);
    List<JobJpaEntity> findByStatus(String status);
}