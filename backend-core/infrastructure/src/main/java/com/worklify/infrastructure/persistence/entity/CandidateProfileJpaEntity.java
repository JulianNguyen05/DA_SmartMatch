package com.worklify.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "candidate_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidateProfileJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", unique = true, nullable = false)
    private Long userId;

    @Column(name = "full_name", nullable = false, length = 255)
    private String fullName;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;          // MỚI

    @Column(length = 255)
    private String headline;           // MỚI

    @Column(length = 20)
    private String phone;

    @Column(name = "email_contact", length = 191)
    private String emailContact;       // MỚI

    @Column(length = 20)
    private String gender;

    private LocalDate dob;

    @Column(length = 500)
    private String address;

    @Column(name = "website_url", length = 255)
    private String websiteUrl;         // MỚI

    @Column(name = "linkedin_url", length = 255)
    private String linkedinUrl;        // MỚI

    @Column(name = "github_url", length = 255)
    private String githubUrl;          // MỚI

    @Column(name = "summary", columnDefinition = "TEXT")
    private String summary;
}