package com.worklify.infrastructure.persistence.repository;

import com.worklify.infrastructure.persistence.entity.DemoProductEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DemoProductJpaRepository extends JpaRepository<DemoProductEntity, Long> {
}