package com.worklify.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * Lớp khởi động (Entry point) của toàn bộ hệ thống Backend Worklify.
 */
@SpringBootApplication(scanBasePackages = {"com.worklify"})
@EnableJpaRepositories(basePackages = {"com.worklify.infrastructure.persistence.repository"})
@EntityScan(basePackages = {"com.worklify.infrastructure.persistence.entity"})
@EnableTransactionManagement
@EnableJpaAuditing
@EnableAsync // Bật lại: cần cho @Async trong DomainEventRabbitMqDispatcher
public class WorklifyApplication {

    public static void main(String[] args) {
        SpringApplication.run(WorklifyApplication.class, args);
    }
}
