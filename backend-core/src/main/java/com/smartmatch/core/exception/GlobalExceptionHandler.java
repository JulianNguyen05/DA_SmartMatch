package com.smartmatch.core.exception;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Bắt lỗi Validation từ DTO
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        // Lấy thông báo lỗi đầu tiên trong danh sách lỗi
        String errorMessage = ex.getBindingResult().getFieldErrors().get(0).getDefaultMessage();
        
        Map<String, String> response = new HashMap<>();
        response.put("message", errorMessage);
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    // Bắt các lỗi chung khác (Tùy chọn)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGlobalException(Exception ex) {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Lỗi máy chủ: " + ex.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}