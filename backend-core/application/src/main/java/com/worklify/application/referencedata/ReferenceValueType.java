package com.worklify.application.referencedata;

/**
 * Hằng số các "type" hợp lệ cho ReferenceValue/ReferenceValueSuggestion,
 * tránh rải rác magic string "SKILL"/"LANGUAGE" trong service.
 */
public final class ReferenceValueType {

    public static final String SKILL = "SKILL";
    public static final String LANGUAGE = "LANGUAGE";

    private ReferenceValueType() {
    }
}