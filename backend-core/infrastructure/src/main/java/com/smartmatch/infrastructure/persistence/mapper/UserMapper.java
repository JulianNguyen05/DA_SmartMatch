package com.smartmatch.infrastructure.persistence.mapper;

import com.smartmatch.domain.user.model.User;
import com.smartmatch.infrastructure.persistence.jpa.UserJpaEntity;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    /**
     * Chuyển từ Domain Model → JPA Entity (trước khi lưu DB)
     */
    public UserJpaEntity toEntity(User user) {
        if (user == null) return null;

        return UserJpaEntity.builder()
                .id(user.getId())
                .email(user.getEmail())
                .password(user.getPassword())
                .phone(user.getPhone())
                .role(user.getRole())
                .enabled(user.isEnabled())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    /**
     * Chuyển từ JPA Entity → Domain Model (sau khi lấy từ DB)
     */
    public User toDomain(UserJpaEntity entity) {
        if (entity == null) return null;

        return User.builder()
                .id(entity.getId())
                .email(entity.getEmail())
                .password(entity.getPassword())
                .phone(entity.getPhone())
                .role(entity.getRole())
                .enabled(entity.isEnabled())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}