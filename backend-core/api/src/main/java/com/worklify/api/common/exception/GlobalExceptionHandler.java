package com.worklify.api.common.exception;

import com.worklify.api.common.response.ApiResponse;
import com.worklify.application.common.exception.ReferenceValueSuggestionPendingException;
import com.worklify.application.common.exception.ResourceNotFoundException; // Nhớ import file này nhé!
import org.springframework.http.HttpStatus;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 1. Bắt lỗi vi phạm quy tắc nghiệp vụ (Fail-Fast từ tầng Service/Domain)
     * Thường ném ra bằng: throw new IllegalArgumentException("Email đã tồn tại");
     */
    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST) // Trả về HTTP Status 400 ra Network tab
    public ApiResponse<Void> handleIllegalArgumentException(IllegalArgumentException ex) {
        // Đưa trực tiếp thông điệp nghiệp vụ cụ thể vào thuộc tính 'message'
        return ApiResponse.error(400, ex.getMessage());
    }

    /**
     * 2. Bắt lỗi không tìm thấy tài nguyên (Ví dụ: Không tìm thấy doanh nghiệp cần duyệt)
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND) // Trả về HTTP Status 404 ra Network tab
    public ApiResponse<Void> handleResourceNotFoundException(ResourceNotFoundException ex) {
        return ApiResponse.error(404, ex.getMessage());
    }

    /**
     * 3. Bắt lỗi ràng buộc dữ liệu đầu vào của các DTO (@NotBlank, @Email, @Size,...)
     * Tự động bóc tách lỗi đầu tiên làm thông điệp đại diện (Top-level message) cho React hiển thị nhanh
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST) // Trả về HTTP Status 400 ra Network tab
    public ApiResponse<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();

        // Thu thập toàn bộ danh sách các trường bị nhập lỗi
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        // Tìm kiếm lỗi đầu tiên xuất hiện để gán làm thông điệp chính ở lớp ngoài cùng
        String topLevelMessage = errors.values().stream()
                .findFirst()
                .orElse("Dữ liệu đầu vào không hợp lệ, vui lòng kiểm tra lại.");

        // Trả về cấu trúc ApiResponse chứa map chi tiết lỗi bên trong trường 'data'
        return ApiResponse.error(errors, topLevelMessage);
    }

    /**
     * 4. Bắt các lỗi hệ thống phát sinh ngoài ý muốn (NullPointerException, lỗi kết nối DB,...)
     */
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR) // Trả về HTTP Status 500 ra Network tab
    public ApiResponse<Void> handleGeneralException(Exception ex) {
        // Log log lỗi chi tiết ra console của IDE để Developer dễ dàng sửa lỗi (Debug)
        ex.printStackTrace();

        return ApiResponse.error(500, "Hệ thống SmartMatch gặp sự cố bất ngờ: " + ex.getMessage());
    }

    /**
     * 1b. Bắt trường hợp candidate submit skill/language chưa tồn tại trong hệ thống.
     * Request đã được ghi nhận dưới dạng ReferenceValueSuggestion (PENDING), nhưng
     * hành động chính (gán skill vào hồ sơ) CHƯA xảy ra ngay — dùng 409 Conflict để
     * FE dễ xử lý qua nhánh catch lỗi chung (status >= 400) như các lỗi nghiệp vụ khác.
     */
    @ExceptionHandler(ReferenceValueSuggestionPendingException.class)
    @ResponseStatus(HttpStatus.CONFLICT) // HTTP 409
    public ApiResponse<Void> handleReferenceValueSuggestionPendingException(ReferenceValueSuggestionPendingException ex) {
        return ApiResponse.error(409, ex.getMessage());
    }
}