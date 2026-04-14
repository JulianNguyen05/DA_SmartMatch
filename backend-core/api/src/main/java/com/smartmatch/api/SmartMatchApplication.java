package com.smartmatch.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
// Quét tất cả các thành phần (Controller, Service, Component, Security)
@ComponentScan(basePackages = "com.smartmatch")
// Quét các Entity JPA
@EntityScan(basePackages = "com.smartmatch.infrastructure.persistence.jpa")
// QUAN TRỌNG: Quét ĐÚNG nơi chứa các Interface JpaRepository
@EnableJpaRepositories(basePackages = {
        "com.smartmatch.infrastructure.persistence.jpa",
        "com.smartmatch.infrastructure.persistence.repository"
})
public class SmartMatchApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartMatchApplication.class, args);
    }
}