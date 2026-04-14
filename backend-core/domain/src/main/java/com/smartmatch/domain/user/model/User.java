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
    private String username;

    private String email;
    private String password;
    private String phoneNumber;
    private Role role;
    @Builder.Default
    private boolean enabled = true;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static User createNewUser(String username, String email, String hashedPassword, String phoneNumber, Role role) {
        User user = User.builder()
                .username(username != null ? username.trim() : null)
                .email(email != null ? email.toLowerCase().trim() : null)
                .password(hashedPassword)
                .phoneNumber(phoneNumber != null ? phoneNumber.trim() : null)
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