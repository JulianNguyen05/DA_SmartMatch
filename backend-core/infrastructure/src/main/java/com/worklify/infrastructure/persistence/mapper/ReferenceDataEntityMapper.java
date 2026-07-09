package com.worklify.infrastructure.persistence.mapper;

import com.worklify.domain.referencedata.model.ReferenceValue;
import com.worklify.domain.referencedata.model.ReferenceValueSuggestion;
import com.worklify.infrastructure.persistence.entity.ReferenceValueJpaEntity;
import com.worklify.infrastructure.persistence.entity.ReferenceValueSuggestionJpaEntity;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ReferenceDataEntityMapper {

    ReferenceValueJpaEntity toEntity(ReferenceValue referenceValue);
    ReferenceValue toDomain(ReferenceValueJpaEntity entity);

    ReferenceValueSuggestionJpaEntity toEntity(ReferenceValueSuggestion suggestion);
    ReferenceValueSuggestion toDomain(ReferenceValueSuggestionJpaEntity entity);
}