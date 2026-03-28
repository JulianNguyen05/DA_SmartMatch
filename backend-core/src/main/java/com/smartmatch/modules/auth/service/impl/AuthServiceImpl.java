package com.smartmatch.modules.auth.service.impl;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.smartmatch.core.dto.MessageResponse; // Thêm import này
import com.smartmatch.modules.auth.dto.LoginRequest;
import com.smartmatch.modules.auth.dto.RegisterRequest;
import com.smartmatch.modules.auth.service.AuthService;
import com.smartmatch.modules.user.entity.Role; // Thêm import này
import com.smartmatch.modules.user.entity.User;
import com.smartmatch.modules.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder; // Công cụ mã hóa mật khẩu

  @Override
  public MessageResponse register(RegisterRequest request) {
    // 1. Kiểm tra trùng lặp Tên đăng nhập
    if (userRepository.existsByUsername(request.getUsername())) {
      throw new RuntimeException("Tên đăng nhập đã tồn tại!");
    }

    // 2. Kiểm tra trùng lặp Email
    if (userRepository.existsByEmail(request.getEmail())) {
      throw new RuntimeException("Email đã được sử dụng!");
    }

    // 3. Kiểm tra trùng lặp Số điện thoại (nếu có nhập)
    if (request.getPhoneNumber() != null && !request.getPhoneNumber().trim().isEmpty()) {
      if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
        throw new RuntimeException("Số điện thoại đã được sử dụng!");
      }
    }

    // 4. Tạo đối tượng User mới từ dữ liệu DTO
    User newUser = User.builder()
        .username(request.getUsername())
        .email(request.getEmail())
        .phoneNumber(request.getPhoneNumber())
        // MÃ HÓA MẬT KHẨU TRƯỚC KHI LƯU
        .password(passwordEncoder.encode(request.getPassword()))
        // Ép kiểu từ String (DTO) sang Enum (Entity)
        .role(Role.valueOf(request.getRole().toUpperCase()))
        .build();

    // 5. Lưu xuống Database
    userRepository.save(newUser);

    // Trả về đối tượng DTO để Controller biến nó thành JSON
    return new MessageResponse("Đăng ký tài khoản thành công!");
  }

  @Override
  public MessageResponse login(LoginRequest request) {
    // 1. Tìm User bằng Username HOẶC Email
    User user = userRepository.findByUsernameOrEmail(request.getUsernameOrEmail(), request.getUsernameOrEmail())
        .orElseThrow(() -> new RuntimeException("Sai tên đăng nhập hoặc email!"));

    // 2. So sánh mật khẩu người dùng nhập vào với mật khẩu đã mã hóa trong Database
    boolean isPasswordMatch = passwordEncoder.matches(request.getPassword(), user.getPassword());
    if (!isPasswordMatch) {
      throw new RuntimeException("Sai mật khẩu!");
    }

    // 3. Nếu mọi thứ đúng, trả về thông báo (Sau này chỗ này sẽ tạo và trả về JWT Token)
    return new MessageResponse("Đăng nhập thành công! Chào mừng " + user.getUsername());
  }
}