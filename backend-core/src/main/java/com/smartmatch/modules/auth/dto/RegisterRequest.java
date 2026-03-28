package com.smartmatch.modules.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

  @NotBlank(message = "Tên đăng nhập không được để trống")
  @Size(min = 3, max = 50, message = "Tên đăng nhập phải từ 3 đến 50 ký tự")
  private String username;

  @NotBlank(message = "Email không được để trống")
  @Email(message = "Email không đúng định dạng")
  private String email;

  @NotBlank(message = "Số điện thoại không được để trống")
  @Pattern(regexp = "^(0[3|5|7|8|9])+([0-9]{8})$", message = "Số điện thoại không hợp lệ")
  private String phoneNumber;

  @NotBlank(message = "Mật khẩu không được để trống")
  @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự")
  private String password;

  // Nhận String từ Frontend thay vì Entity Role để tránh lỗi Deserialize JSON
  @NotBlank(message = "Vai trò không được để trống")
  private String role;
}