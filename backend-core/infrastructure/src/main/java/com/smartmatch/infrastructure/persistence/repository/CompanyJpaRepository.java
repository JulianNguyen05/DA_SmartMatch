package com.smartmatch.infrastructure.persistence.repository;

import com.smartmatch.infrastructure.persistence.jpa.CompanyJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CompanyJpaRepository extends JpaRepository<CompanyJpaEntity, Long> {
    Optional<CompanyJpaEntity> findByOwnerId(Long ownerId);
}