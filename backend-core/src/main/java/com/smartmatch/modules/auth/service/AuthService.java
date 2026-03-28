package com.smartmatch.modules.auth.service;

import com.smartmatch.modules.auth.dto.LoginRequest;
import com.smartmatch.modules.auth.dto.RegisterRequest;

public interface AuthService {
  String register(RegisterRequest request);

  String login(LoginRequest request);
}
