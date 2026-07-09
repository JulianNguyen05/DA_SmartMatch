package com.worklify.domain.referencedata.model;

import lombok.Builder;
import lombok.Getter;

import java.util.Objects;

@Getter
public class ReferenceValue {

    private final Long id;
    private final String type;
    private final String name;

    @Builder
    private ReferenceValue(Long id, String type, String name) {
        this.id = id;
        this.type = type;
        this.name = name;
    }

    /** Tạo mới (chưa có id, sẽ được gán sau khi persist). */
    public static ReferenceValue create(String type, String name) {
        if (type == null || type.isBlank()) {
            throw new IllegalArgumentException("type không được để trống");
        }
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("name không được để trống");
        }
        return new ReferenceValue(null, normalizeType(type), name.trim());
    }

    /** Dựng lại từ persistence (đã có id). */
    public static ReferenceValue restore(Long id, String type, String name) {
        if (id == null) {
            throw new IllegalArgumentException("id không được null khi restore");
        }
        return new ReferenceValue(id, type, name);
    }

    private static String normalizeType(String type) {
        return type.trim().toUpperCase();
    }

    public boolean isSameTypeAndName(String type, String name) {
        return this.type.equalsIgnoreCase(type) && this.name.equalsIgnoreCase(name);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ReferenceValue that)) return false;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}