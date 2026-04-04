package com.smartmatch.domain.user.model;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    private Long id;
    private String email;
    private String password;
    private String phone;
    private Role role;
    private boolean enabled = true;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static User createNewUser(String email, String hashedPassword, String phone, Role role) {
        User user = User.builder()
                .email(email.toLowerCase().trim())
                .password(hashedPassword)
                .phone(phone.trim())
                .role(role)
                .enabled(true)
                .build();
        user.onCreate();
        return user;
    }

    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}