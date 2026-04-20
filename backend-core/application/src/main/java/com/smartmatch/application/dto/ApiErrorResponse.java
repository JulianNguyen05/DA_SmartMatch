// backend-core/application/src/main/java/com/smartmatch/application/dto/ApiErrorResponse.java
package com.smartmatch.application.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO chuẩn trả về lỗi cho tất cả API
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApiErrorResponse {

    private LocalDateTime timestamp;
    private int status;
    private String error;
    private String message;
    private String path;           // đường dẫn API gây lỗi

    public ApiErrorResponse(int status, String message, String path) {
        this.timestamp = LocalDateTime.now();
        this.status = status;
        this.error = org.springframework.http.HttpStatus.valueOf(status).getReasonPhrase();
        this.message = message;
        this.path = path;
    }

    // Constructor đơn giản cho các lỗi cơ bản
    public static ApiErrorResponse of(int status, String message) {
        return new ApiErrorResponse(status, message, null);
    }
}