package com.smartmatch.modules.auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartmatch.core.dto.MessageResponse;
import com.smartmatch.modules.auth.dto.LoginRequest;
import com.smartmatch.modules.auth.dto.RegisterRequest;
import com.smartmatch.modules.auth.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173") // Cấu hình CORS chuẩn cho Vite React
public class AuthController {

  private final AuthService authService;

  @PostMapping("/register")
  public ResponseEntity<MessageResponse> registerUser(@Valid @RequestBody RegisterRequest request) {
    // Nếu có lỗi (ví dụ: trùng email), AuthService sẽ ném RuntimeException
    // và sẽ được GlobalExceptionHandler (nếu bạn đã cấu hình) bắt lại.
    MessageResponse response = authService.register(request);
    return ResponseEntity.ok(response);
  }

  @PostMapping("/login")
  public ResponseEntity<MessageResponse> login(@Valid @RequestBody LoginRequest request) {
    try {
      // Nhận MessageResponse từ Service thay vì String
      MessageResponse result = authService.login(request);
      return ResponseEntity.ok(result);
    } catch (RuntimeException e) {
      // Đóng gói thông báo lỗi ("Sai mật khẩu", v.v.) vào MessageResponse
      // để đảm bảo Frontend luôn nhận được JSON: { "message": "Sai mật khẩu!" }
      return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
    }
  }
}