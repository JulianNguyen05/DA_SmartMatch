package com.worklify.infrastructure.persistence.repository;

import com.worklify.domain.referencedata.model.SuggestionStatus;
import com.worklify.infrastructure.persistence.entity.ReferenceValueSuggestionJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReferenceValueSuggestionJpaRepository extends JpaRepository<ReferenceValueSuggestionJpaEntity, Long> {

    List<ReferenceValueSuggestionJpaEntity> findByStatus(SuggestionStatus status);

    List<ReferenceValueSuggestionJpaEntity> findByType(String type);
}