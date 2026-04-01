package com.smartmatch.infrastructure.persistence.repository;

import com.smartmatch.domain.user.model.User;
import com.smartmatch.domain.user.repository.UserRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserJpaRepository extends JpaRepository<User, Long>, UserRepository {
    // Spring Data JPA tự implement các method: findByEmail, existsByEmail, save
}