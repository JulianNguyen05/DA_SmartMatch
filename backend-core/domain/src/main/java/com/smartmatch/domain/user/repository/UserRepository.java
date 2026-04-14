package com.smartmatch.domain.user.repository;

import com.smartmatch.domain.user.model.User;

import java.util.Optional;

public interface UserRepository {

    User save(User user);

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByPhoneNumber(String phoneNumber);

    // Có thể thêm sau này:
    // Optional<User> findById(Long id);
    // boolean existsById(Long id);
}