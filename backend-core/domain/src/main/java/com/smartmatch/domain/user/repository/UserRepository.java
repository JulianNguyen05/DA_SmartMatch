// backend-core/domain/src/main/java/com/smartmatch/domain/user/repository/UserRepository.java
package com.smartmatch.domain.user.repository;

import com.smartmatch.domain.user.model.User;
import java.util.List;
import java.util.Optional;

public interface UserRepository {

    User save(User user);

    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByPhoneNumber(String phoneNumber);
    List<User> findAll();
    Optional<User> findById(Long id);
    void deleteById(Long id);

    // Có thể thêm sau này:
    // Optional<User> findById(Long id);
    // boolean existsById(Long id);
}