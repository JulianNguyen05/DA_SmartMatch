package com.smartmatch.infrastructure.persistence.jpa;

import com.smartmatch.domain.user.model.Role;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 1. Thêm cột username (bắt buộc nhập và không được trùng)
    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    // 2. Đổi tên biến 'phone' thành 'phoneNumber'
    // Đặt tên cột rõ ràng trong DB là 'phone_number' để chuẩn convention của SQL
    @Column(name = "phone_number", unique = true, nullable = false)
    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    // Thêm @Builder.Default để giá trị true không bị ghi đè thành false khi dùng Builder
    @Builder.Default
    private boolean enabled = true;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Đã xóa bỏ hàm public String getUsername() {} bị lỗi ở cuối file
    // Lombok (@Getter) sẽ tự động sinh ra hàm đó cho bạn.
}