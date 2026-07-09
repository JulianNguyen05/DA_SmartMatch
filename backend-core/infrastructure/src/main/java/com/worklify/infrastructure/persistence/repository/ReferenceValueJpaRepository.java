package com.worklify.infrastructure.persistence.repository;

import com.worklify.infrastructure.persistence.entity.ReferenceValueJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReferenceValueJpaRepository extends JpaRepository<ReferenceValueJpaEntity, Long> {

    Optional<ReferenceValueJpaEntity> findByTypeAndNameIgnoreCase(String type, String name);

    /** Dùng cho dropdown search khi candidate gõ tìm skill/language. */
    List<ReferenceValueJpaEntity> findByTypeAndNameContainingIgnoreCase(String type, String keyword);
}