package com.worklify.application.referencedata.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SuggestionRequest {
    @NotBlank(message = "type không được để trống")
    private String type;

    @NotBlank(message = "Tên đề xuất không được để trống")
    private String name;

    /**
     * CREATE / EDIT / DELETE. Để trống mặc định hiểu là CREATE (giữ tương thích
     * ngược với các request cũ chưa gửi field này).
     */
    private String requestType;

    /** Bắt buộc khi requestType = EDIT hoặc DELETE; bỏ trống khi CREATE. */
    private Long targetReferenceValueId;
}