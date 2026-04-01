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
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã tồn tại");
        }

        // Chỉ cho phép EMPLOYER hoặc CANDIDATE tự đăng ký (ADMIN do admin tạo)
        Role role = Role.valueOf(request.getRole().toUpperCase());

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(role)
                .enabled(true)
                .build();

        User savedUser = userRepository.save(user);

        // Tạo token
        var userDetails = new org.springframework.security.core.userdetails.User(
                savedUser.getEmail(), savedUser.getPassword(),
                List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + savedUser.getRole().name()))
        );

        String token = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        return new AuthResponse(token, refreshToken, savedUser.getRole().name(), savedUser.getEmail());
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Email hoặc mật khẩu không đúng"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Email hoặc mật khẩu không đúng");
        }

        var userDetails = new org.springframework.security.core.userdetails.User(
                user.getEmail(), user.getPassword(),
                List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );

        String token = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        return new AuthResponse(token, refreshToken, user.getRole().name(), user.getEmail());
    }
}