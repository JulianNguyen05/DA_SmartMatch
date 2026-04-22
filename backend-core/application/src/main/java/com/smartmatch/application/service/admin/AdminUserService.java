package com.smartmatch.application.service.admin;

import com.smartmatch.application.dto.admin.UserAdminResponse;
import java.util.List;

public interface AdminUserService {
    List<UserAdminResponse> getAllUsers();
    void toggleUserStatus(Long userId, boolean enabled);
    void deleteUser(Long userId);
}