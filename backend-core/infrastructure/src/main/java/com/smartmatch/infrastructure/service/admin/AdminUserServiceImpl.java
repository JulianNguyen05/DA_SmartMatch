package com.smartmatch.infrastructure.service.admin;

import com.smartmatch.application.dto.admin.UserAdminResponse;
import com.smartmatch.application.service.admin.AdminUserService;
import com.smartmatch.domain.user.model.User;
import com.smartmatch.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminUserServiceImpl implements AdminUserService {

    private final UserRepository userRepository;

    @Override
    public List<UserAdminResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(user -> UserAdminResponse.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .role(user.getRole().name())
                        .enabled(user.isEnabled())
                        .createdAt(user.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void toggleUserStatus(Long userId, boolean enabled) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng!"));

        if ("ADMIN".equals(user.getRole().name())) {
            throw new IllegalArgumentException("Không thể thay đổi trạng thái của tài khoản Quản trị viên (ADMIN)!");
        }

        user.setEnabled(enabled);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng!"));

        if ("ADMIN".equals(user.getRole().name())) {
            throw new IllegalArgumentException("Không thể xóa tài khoản Quản trị viên (ADMIN)!");
        }

        userRepository.deleteById(userId);
    }
}