package com.worklify.domain.referencedata.repository;

import com.worklify.domain.referencedata.model.ReferenceValue;

import java.util.List;
import java.util.Optional;

/**
 * Port (outbound) cho ReferenceValue — thay thế SkillRepository cũ, dùng chung
 * cho mọi type (SKILL, LANGUAGE, ...).
 */
public interface ReferenceValueRepository {

    Optional<ReferenceValue> findById(Long id);

    Optional<ReferenceValue> findByTypeAndNameIgnoreCase(String type, String name);

    /** Dùng cho dropdown search khi user gõ tìm skill/language. */
    List<ReferenceValue> searchByTypeAndKeyword(String type, String keyword);

    ReferenceValue save(ReferenceValue referenceValue);

    void deleteById(Long id);
}