package com.worklify.application.candidate.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

/**
 * Response tổng hợp cho ProfilePage — gộp layout (vị trí/ẩn-hiện block) và
 * toàn bộ dữ liệu nghiệp vụ của từng block, phục vụ FE render sandbox chỉ với
 * 1 lần gọi API thay vì 12+ request riêng lẻ.
 */
@Data
@Builder
public class CandidateProfileFullResponse {
    private List<ProfileLayoutItemResponse> layout;

    // Block đơn (PERSONAL_INFO, AVATAR, SOCIAL_LINKS đều gộp chung trong CandidateProfileResponse)
    private CandidateProfileResponse profile;

    // Block danh sách — đã sort theo displayOrder từ service
    private List<ActivityResponse> activities;
    private List<AwardResponse> awards;
    private List<CandidateSkillResponse> skills;
    private List<CertificationResponse> certifications;
    private List<EducationResponse> educations;
    private List<ExperienceResponse> experiences;
    private List<HobbyResponse> hobbies;
    private List<LanguageResponse> languages;
    private List<ProjectResponse> projects;
}