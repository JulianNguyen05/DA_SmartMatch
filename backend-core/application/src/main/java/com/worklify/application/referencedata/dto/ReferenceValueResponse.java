package com.worklify.application.referencedata.dto;

import lombok.Builder;
import lombok.Data;

/**
 * Thay thế SkillResponse cũ — dùng chung cho mọi loại ReferenceValue
 * (SKILL, LANGUAGE, ...), phục vụ dropdown search ở FE.
 */
@Data
@Builder
public class ReferenceValueResponse {
    private Long id;
    private String type;
    private String name;
}