package com.smartmatch.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * SmartMatch Backend Main Application
 */
@SpringBootApplication
@EntityScan(basePackages = "com.smartmatch.domain")
@EnableJpaRepositories(basePackages = "com.smartmatch.infrastructure.persistence.repository")
@ComponentScan(basePackages = {
        "com.smartmatch.api",
        "com.smartmatch.application",
        "com.smartmatch.infrastructure"
})
public class SmartMatchApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartMatchApplication.class, args);
    }
}