package com.smartmatch.modules.auth.service;

import com.smartmatch.core.dto.MessageResponse;
import com.smartmatch.modules.auth.dto.LoginRequest;
import com.smartmatch.modules.auth.dto.RegisterRequest;

public interface AuthService {
  MessageResponse register(RegisterRequest request);

  MessageResponse login(LoginRequest request);
}
