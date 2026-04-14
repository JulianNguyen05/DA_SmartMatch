package com.smartmatch.infrastructure.persistence.repository;

import com.smartmatch.domain.user.model.User;
import com.smartmatch.domain.user.repository.UserRepository;
import com.smartmatch.infrastructure.persistence.jpa.UserJpaEntity;
import com.smartmatch.infrastructure.persistence.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class UserRepositoryImpl implements UserRepository {

    private final UserJpaRepository jpaRepository;

    // Nếu UserMapper của bạn dùng @Component thì giữ nguyên dòng này.
    // (Nếu dùng static methods như code cũ tôi gửi thì có thể xóa biến này và gọi UserMapper.toEntity)
    private final UserMapper userMapper;

    @Override
    public boolean existsByUsername(String username) {
        // SỬA: Đổi userJpaRepository thành jpaRepository
        return jpaRepository.existsByUsername(username);
    }

    @Override
    public User save(User user) {
        UserJpaEntity entity = userMapper.toEntity(user);
        UserJpaEntity savedEntity = jpaRepository.save(entity);
        return userMapper.toDomain(savedEntity);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return jpaRepository.findByEmail(email)
                .map(userMapper::toDomain);
    }

    @Override
    public boolean existsByEmail(String email) {
        return jpaRepository.existsByEmail(email);
    }

    @Override
    public boolean existsByPhoneNumber(String phoneNumber) {
        // SỬA 1: Đổi chữ 'p' thành 'P' viết hoa để khớp với Interface UserRepository
        // SỬA 2: Đổi existsByPhone thành existsByPhoneNumber vì Entity đã đổi thành biến phoneNumber
        return jpaRepository.existsByPhoneNumber(phoneNumber);
    }
}