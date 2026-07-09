package com.worklify.domain.candidate.model;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import java.time.LocalDate;

@Getter
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class CandidateProfile {
    private Long id;
    private Long userId;
    private String fullName;
    private String avatarUrl;      // MỚI
    private String headline;       // MỚI - chức danh/vị trí mong muốn
    private String phone;
    private String emailContact;   // MỚI
    private String gender;
    private LocalDate dob;
    private String address;
    private String websiteUrl;     // MỚI
    private String linkedinUrl;    // MỚI
    private String githubUrl;      // MỚI
    private String summary;

    public static CandidateProfile create(Long userId, String fullName) {
        if (userId == null || fullName == null || fullName.trim().isEmpty()) {
            throw new IllegalArgumentException("Thông tin bắt buộc không hợp lệ.");
        }
        return CandidateProfile.builder()
                .userId(userId)
                .fullName(fullName)
                .build();
    }

    // [ĐÃ SỬA] Thêm đủ field mới vào chữ ký — cần cập nhật lại các nơi đang gọi hàm này
    public void updateProfileDetails(String fullName, String headline, String phone,
                                     String emailContact, String gender, LocalDate dob,
                                     String address, String summary) {
        if (fullName == null || fullName.trim().isEmpty()) {
            throw new IllegalArgumentException("Họ tên không được để trống.");
        }
        this.fullName = fullName;
        this.headline = headline;
        this.phone = phone;
        this.emailContact = emailContact;
        this.gender = gender;
        this.dob = dob;
        this.address = address;
        this.summary = summary;
    }

    // Business Behavior: cập nhật ảnh đại diện — tách riêng vì đây là hành động độc lập (giống updateLogo bên CompanyProfile)
    public void updateAvatar(String newAvatarUrl) {
        this.avatarUrl = newAvatarUrl;
    }

    // Business Behavior: cập nhật các đường link mạng xã hội/portfolio
    public void updateSocialLinks(String websiteUrl, String linkedinUrl, String githubUrl) {
        this.websiteUrl = websiteUrl;
        this.linkedinUrl = linkedinUrl;
        this.githubUrl = githubUrl;
    }
}