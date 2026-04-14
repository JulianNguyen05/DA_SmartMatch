package com.smartmatch.infrastructure.service.auth;

import com.smartmatch.application.dto.auth.AuthResponse;
import com.smartmatch.application.dto.auth.LoginRequest;
import com.smartmatch.application.dto.auth.RegisterRequest;
import com.smartmatch.application.service.auth.AuthService;
import com.smartmatch.domain.user.model.Role;
import com.smartmatch.domain.user.model.User;
import com.smartmatch.domain.user.repository.UserRepository;
import com.smartmatch.infrastructure.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    @Override
    public AuthResponse register(RegisterRequest request) {
        // Cập nhật lấy username và phoneNumber từ request
        String username = request.getUsername() != null ? request.getUsername().trim() : null;
        String email = request.getEmail() != null ? request.getEmail().toLowerCase().trim() : null;
        String phoneNumber = request.getPhoneNumber() != null ? request.getPhoneNumber().trim() : null;

        // Kiểm tra tồn tại
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email đã tồn tại");
        }
        // Thêm kiểm tra tồn tại cho username nếu ứng dụng yêu cầu username là duy nhất
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại");
        }
        // Cập nhật tên phương thức tương ứng trong UserRepository (existsByPhone -> existsByPhoneNumber)
        if (userRepository.existsByPhoneNumber(phoneNumber)) {
            throw new RuntimeException("Số điện thoại đã tồn tại");
        }

        // Validate role
        Role role;
        try {
            role = Role.valueOf(request.getRole().toUpperCase());
            if (role == Role.ADMIN) {
                throw new RuntimeException("Không được tự đăng ký tài khoản ADMIN");
            }
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new RuntimeException("Role không hợp lệ. Chỉ chấp nhận EMPLOYER hoặc CANDIDATE");
        }

        // Mã hóa mật khẩu và tạo User domain với các tham số mới
        String hashedPassword = passwordEncoder.encode(request.getPassword());
        User user = User.createNewUser(username, email, hashedPassword, phoneNumber, role);

        // Lưu user
        User savedUser = userRepository.save(user);

        // Tạo JWT
        UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername(savedUser.getEmail())
                .password(savedUser.getPassword())
                .authorities(new SimpleGrantedAuthority("ROLE_" + savedUser.getRole().name()))
                .build();

        String token = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        return new AuthResponse(token, refreshToken, savedUser.getRole().name(), savedUser.getEmail());
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail() != null ? request.getEmail().toLowerCase().trim() : "";

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Email hoặc mật khẩu không đúng"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Email hoặc mật khẩu không đúng");
        }

        if (!user.isEnabled()) {
            throw new RuntimeException("Tài khoản đã bị khóa");
        }

        UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPassword())
                .authorities(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
                .build();

        String token = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        return new AuthResponse(token, refreshToken, user.getRole().name(), user.getEmail());
    }
}