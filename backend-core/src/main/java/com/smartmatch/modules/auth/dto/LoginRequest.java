package com.smartmatch.modules.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {

  @NotBlank(message = "Email hoặc Tên đăng nhập không được để trống")
  @Size(min = 3, max = 100, message = "Tài khoản phải từ 3 đến 100 ký tự")
  private String usernameOrEmail;

  @NotBlank(message = "Mật khẩu không được để trống")
  @Size(min = 6, max = 50, message = "Mật khẩu không hợp lệ")
  private String password;
}