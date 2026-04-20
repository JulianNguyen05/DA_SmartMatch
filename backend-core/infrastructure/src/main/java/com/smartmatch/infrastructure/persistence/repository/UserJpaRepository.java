// backend-core/infrastructure/src/main/java/com/smartmatch/infrastructure/persistence/repository/UserJpaRepository.java
package com.smartmatch.infrastructure.persistence.repository;

import com.smartmatch.infrastructure.persistence.jpa.UserJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserJpaRepository extends JpaRepository<UserJpaEntity, Long> {

    Optional<UserJpaEntity> findByEmail(String email);

    Optional<UserJpaEntity> findByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByPhoneNumber(String phoneNumber);
    boolean existsByUsername(String username);

    // Có thể thêm sau:
    // Optional<UserJpaEntity> findByPhone(String phone);
}