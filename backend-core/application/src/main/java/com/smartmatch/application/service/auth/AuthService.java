package com.smartmatch.application.service.auth;

import com.smartmatch.application.dto.auth.AuthResponse;
import com.smartmatch.application.dto.auth.LoginRequest;
import com.smartmatch.application.dto.auth.RegisterRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
}