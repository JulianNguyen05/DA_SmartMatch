package com.worklify.domain.referencedata.repository;

import com.worklify.domain.referencedata.model.ReferenceValueSuggestion;
import com.worklify.domain.referencedata.model.SuggestionStatus;

import java.util.List;
import java.util.Optional;

/**
 * Port (outbound) cho ReferenceValueSuggestion — phục vụ flow candidate đề xuất
 * skill/language mới và admin duyệt/từ chối.
 */
public interface ReferenceValueSuggestionRepository {

    ReferenceValueSuggestion save(ReferenceValueSuggestion suggestion);

    Optional<ReferenceValueSuggestion> findById(Long id);

    List<ReferenceValueSuggestion> findByStatus(SuggestionStatus status);

    List<ReferenceValueSuggestion> findByType(String type);
}