package com.worklify.application.candidate.service;

import com.worklify.application.candidate.dto.*;
import com.worklify.application.common.dto.PageResponse;
import com.worklify.application.referencedata.dto.ReferenceValueResponse;
import com.worklify.application.referencedata.dto.SuggestionResponse;
import com.worklify.domain.common.DomainPageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface CandidateService {
    CandidateProfileResponse createProfile(Long userId, CandidateProfileRequest request);
    CandidateProfileResponse updateProfile(Long userId, CandidateProfileRequest request);
    CandidateProfileResponse getProfileByUserId(Long userId);

    CandidateProfileResponse uploadAvatar(Long userId, MultipartFile file);

    CvDocumentResponse uploadCv(Long userId, MultipartFile file);
    CvDocumentResponse saveGeneratedCv(Long userId, String rawText);
    CvDocumentResponse getLatestGeneratedCv(Long userId);
    List<CvDocumentResponse> getCvsByUserId(Long userId);
    void deleteCv(Long userId, Long cvId);

    List<CandidateSkillResponse> getSkillsByUserId(Long userId);
    CandidateSkillResponse createSkill(Long userId, CandidateSkillRequest request);
    CandidateSkillResponse updateSkill(Long userId, Long skillId, CandidateSkillRequest request);

    void addSkillToCandidate(Long userId, Long skillId);
    void removeSkillFromCandidate(Long userId, Long skillId);

    // [MỚI] Dropdown search + đề xuất bổ sung, dùng chung cho SKILL/LANGUAGE/...
    List<ReferenceValueResponse> searchReferenceValues(String type, String keyword);
    SuggestionResponse suggestReferenceValue(Long userId, String type, String name);

    CvDocumentResponse renameCv(Long userId, Long cvId, String newName);
    PageResponse<CandidateProfileResponse> searchCandidates(String keyword, DomainPageable pageable);
    CvDocumentResponse getCvDetail(Long userId, Long cvId);
    CvDocumentResponse updateGeneratedCv(Long userId, Long cvId, String rawText);

    CvDocumentResponse uploadCvThumbnail(Long userId, Long cvId, MultipartFile file);

    List<EducationResponse> getEducationsByUserId(Long userId);
    EducationResponse createEducation(Long userId, EducationRequest request);
    EducationResponse updateEducation(Long userId, Long educationId, EducationRequest request);
    void deleteEducation(Long userId, Long educationId);

    // Experience
    List<ExperienceResponse> getExperiencesByUserId(Long userId);
    ExperienceResponse createExperience(Long userId, ExperienceRequest request);
    ExperienceResponse updateExperience(Long userId, Long experienceId, ExperienceRequest request);
    void deleteExperience(Long userId, Long experienceId);

    // Project
    List<ProjectResponse> getProjectsByUserId(Long userId);
    ProjectResponse createProject(Long userId, ProjectRequest request);
    ProjectResponse updateProject(Long userId, Long projectId, ProjectRequest request);
    void deleteProject(Long userId, Long projectId);

    // Certification
    List<CertificationResponse> getCertificationsByUserId(Long userId);
    CertificationResponse createCertification(Long userId, CertificationRequest request);
    CertificationResponse updateCertification(Long userId, Long certificationId, CertificationRequest request);
    void deleteCertification(Long userId, Long certificationId);

    // Activity
    List<ActivityResponse> getActivitiesByUserId(Long userId);
    ActivityResponse createActivity(Long userId, ActivityRequest request);
    ActivityResponse updateActivity(Long userId, Long activityId, ActivityRequest request);
    void deleteActivity(Long userId, Long activityId);

    // Award
    List<AwardResponse> getAwardsByUserId(Long userId);
    AwardResponse createAward(Long userId, AwardRequest request);
    AwardResponse updateAward(Long userId, Long awardId, AwardRequest request);
    void deleteAward(Long userId, Long awardId);

    // Hobby
    List<HobbyResponse> getHobbiesByUserId(Long userId);
    HobbyResponse createHobby(Long userId, HobbyRequest request);
    HobbyResponse updateHobby(Long userId, Long hobbyId, HobbyRequest request);
    void deleteHobby(Long userId, Long hobbyId);

    // Language
    List<LanguageResponse> getLanguagesByUserId(Long userId);
    LanguageResponse createLanguage(Long userId, LanguageRequest request);
    LanguageResponse updateLanguage(Long userId, Long languageId, LanguageRequest request);
    void deleteLanguage(Long userId, Long languageId);

    // Lấy layout hiện tại; tự khởi tạo mặc định nếu candidate mở ProfilePage lần đầu
    List<ProfileLayoutItemResponse> getProfileLayout(Long userId);

    // Kéo-thả đổi vị trí nhiều block cùng lúc
    List<ProfileLayoutItemResponse> reorderProfileLayout(Long userId, ProfileLayoutReorderRequest request);

    // Ẩn/hiện 1 block
    ProfileLayoutItemResponse toggleBlockVisibility(Long userId, String blockType, boolean visible);
}