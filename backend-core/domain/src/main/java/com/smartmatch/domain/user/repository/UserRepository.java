package com.smartmatch.domain.user.repository;

import com.smartmatch.domain.user.model.User;
import java.util.Optional;

public interface UserRepository {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    User save(User user);
}