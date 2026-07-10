package com.worklify.application.candidate.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProfileLayoutItemResponse {
    private String blockType;
    private int position;
    private boolean visible;
    /** true nếu block chứa danh sách nhiều item (FE dùng để biết block nào có sắp xếp item con). */
    private boolean repeatable;
}