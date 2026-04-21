// backend-core/infrastructure/src/main/java/com/smartmatch/infrastructure/persistence/repository/JobJpaRepository.java
package com.smartmatch.infrastructure.persistence.repository;

import com.smartmatch.domain.common.enums.JobStatus;
import com.smartmatch.infrastructure.persistence.jpa.JobJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobJpaRepository extends JpaRepository<JobJpaEntity, Long> {
    List<JobJpaEntity> findByCompanyId(Long companyId);
    List<JobJpaEntity> findByPostedById(Long postedById);                    // ← MỚI
    List<JobJpaEntity> findByStatus(JobStatus status);
    List<JobJpaEntity> findByStatus(String status);
    Optional<JobJpaEntity> findByIdAndPostedById(Long id, Long postedById); // ← MỚI
}