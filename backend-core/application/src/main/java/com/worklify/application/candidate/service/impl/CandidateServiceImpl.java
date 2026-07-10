package com.worklify.application.candidate.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.worklify.application.candidate.dto.*;
import com.worklify.application.candidate.service.CandidateService;
import com.worklify.application.common.dto.PageResponse;
import com.worklify.application.common.exception.ReferenceValueSuggestionPendingException;
import com.worklify.application.common.port.FileStoragePort;
import com.worklify.application.referencedata.ReferenceValueType;
import com.worklify.application.referencedata.dto.ReferenceValueResponse;
import com.worklify.domain.candidate.model.*;
import com.worklify.domain.candidate.repository.*;
import com.worklify.domain.common.DomainPage;
import com.worklify.domain.common.DomainPageable;
import com.worklify.domain.referencedata.model.ReferenceValue;
import com.worklify.domain.referencedata.model.ReferenceValueSuggestion;
import com.worklify.domain.referencedata.repository.ReferenceValueRepository;
import com.worklify.domain.referencedata.repository.ReferenceValueSuggestionRepository;
import com.worklify.application.referencedata.dto.SuggestionResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class CandidateServiceImpl implements CandidateService {

    private final CandidateProfileRepository candidateProfileRepository;
    private final CvDocumentRepository cvDocumentRepository;
    private final CandidateSkillRepository candidateSkillRepository;
    private final ReferenceValueRepository referenceValueRepository;
    private final ReferenceValueSuggestionRepository referenceValueSuggestionRepository;
    private final CandidateProfileLayoutRepository candidateProfileLayoutRepository;
    private final FileStoragePort fileStoragePort;
    private final ObjectMapper objectMapper;
    private final EducationRepository educationRepository;
    private final ExperienceRepository experienceRepository;
    private final ProjectRepository projectRepository;
    private final CertificationRepository certificationRepository;
    private final ActivityRepository activityRepository;
    private final AwardRepository awardRepository;
    private final HobbyRepository hobbyRepository;
    private final LanguageRepository languageRepository;

    @Override
    public CandidateProfileResponse createProfile(Long userId, CandidateProfileRequest request) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseGet(() -> CandidateProfile.create(userId, request.getFullName()));

        profile.updateProfileDetails(
                request.getFullName(),
                request.getHeadline(),
                request.getPhone(),
                request.getEmailContact(),
                request.getGender(),
                request.getDob(),
                request.getAddress(),
                request.getSummary()
        );
        profile.updateSocialLinks(request.getWebsiteUrl(), request.getLinkedinUrl(), request.getGithubUrl());

        CandidateProfile saved = candidateProfileRepository.save(profile);

        // Đồng bộ kỹ năng từ chuỗi phân cách dấu phẩy (nếu có) — gom lại skill nào bị bỏ qua để báo cho candidate
        List<String> skippedSkills = syncSkillsFromCsv(saved.getId(), request.getSkills());

        CandidateProfileResponse response = mapToProfileResponse(saved);
        response.setSkippedSkillSuggestions(skippedSkills);
        return response;
    }

    @Override
    public CandidateProfileResponse updateProfile(Long userId, CandidateProfileRequest request) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hồ sơ ứng viên."));

        // [SỬA] Khớp chữ ký mới của updateProfileDetails và thêm updateSocialLinks
        profile.updateProfileDetails(
                request.getFullName(),
                request.getHeadline(),
                request.getPhone(),
                request.getEmailContact(),
                request.getGender(),
                request.getDob(),
                request.getAddress(),
                request.getSummary()
        );
        profile.updateSocialLinks(request.getWebsiteUrl(), request.getLinkedinUrl(), request.getGithubUrl());

        CandidateProfile saved = candidateProfileRepository.save(profile);
        return mapToProfileResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public CandidateProfileResponse getProfileByUserId(Long userId) {
        return mapToProfileResponse(
                candidateProfileRepository.findByUserId(userId)
                        .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hồ sơ ứng viên."))
        );
    }

    // [THÊM MỚI] Upload Avatar
    @Override
    public CandidateProfileResponse uploadAvatar(Long userId, MultipartFile file) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hồ sơ ứng viên."));

        String savedRelativePath = fileStoragePort.storeFile(file, "avatars", String.valueOf(userId));
        profile.updateAvatar("/uploads/" + savedRelativePath);

        return mapToProfileResponse(candidateProfileRepository.save(profile));
    }

    @Override
    public CvDocumentResponse uploadCv(Long userId, MultipartFile file) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Yêu cầu tạo hồ sơ cá nhân trước khi tải CV lên."));

        String savedRelativePath = fileStoragePort.storeFile(file, "cv", String.valueOf(userId));
        String uploadedFilePath = "/uploads/" + savedRelativePath;
        String extractedText = "Extracted text from " + file.getOriginalFilename();

        CvDocument cv = CvDocument.upload(profile.getId(), uploadedFilePath, file.getOriginalFilename(), extractedText);

        return mapToCvResponse(cvDocumentRepository.save(cv));
    }

    @Override
    public CvDocumentResponse saveGeneratedCv(Long userId, String rawText) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Yêu cầu tạo hồ sơ cá nhân trước khi lưu bản thảo CV."));

        Long candidateId = profile.getId();

        CvDocument cv = CvDocument.generate(candidateId, "CV_Tu_Tao", rawText);
        CvDocument saved = cvDocumentRepository.save(cv);

        try {
            List<Map<String, Object>> blocks = objectMapper.readValue(
                    rawText, new TypeReference<List<Map<String, Object>>>() {}
            );
            // ... logic bóc tách skill nếu cần
        } catch (Exception e) {
            log.error("Lỗi parse JSON CV Builder skills cho userId: {}", userId, e);
        }

        return mapToCvResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public CvDocumentResponse getLatestGeneratedCv(Long userId) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng chưa có hồ sơ ứng viên."));

        return cvDocumentRepository.findByCandidateId(profile.getId()).stream()
                .filter(cv -> Boolean.TRUE.equals(cv.getIsGenerated()))
                .max(java.util.Comparator.comparing(CvDocument::getCreatedAt))
                .map(this::mapToCvResponse)
                .orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CvDocumentResponse> getCvsByUserId(Long userId) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hồ sơ ứng viên."));

        return cvDocumentRepository.findByCandidateId(profile.getId()).stream()
                .map(this::mapToCvResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteCv(Long userId, Long cvId) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hồ sơ ứng viên."));

        CvDocument cv = cvDocumentRepository.findById(cvId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy CV."));

        if (!cv.getCandidateId().equals(profile.getId())) {
            throw new IllegalArgumentException("Bạn không có quyền xóa CV này.");
        }

        cvDocumentRepository.deleteById(cvId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CandidateSkillResponse> getSkillsByUserId(Long userId) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hồ sơ ứng viên với User ID: " + userId));

        return candidateSkillRepository.findByCandidateId(profile.getId()).stream()
                .map(cs -> {
                    ReferenceValue skill = referenceValueRepository.findById(cs.getSkillId())
                            .orElseThrow(() -> new IllegalArgumentException("Kỹ năng không tồn tại."));
                    return CandidateSkillResponse.builder()
                            .id(skill.getId())
                            .skillName(skill.getName())
                            .level(cs.getLevel())
                            .yearsOfEx(cs.getYearsOfEx())
                            .description(cs.getNote())
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Override
    public CandidateSkillResponse createSkill(Long userId, CandidateSkillRequest request) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hồ sơ ứng viên."));

        ReferenceValue skill = referenceValueRepository
                .findByTypeAndNameIgnoreCase(ReferenceValueType.SKILL, request.getSkillName())
                .orElseGet(() -> {
                    referenceValueSuggestionRepository.save(
                            ReferenceValueSuggestion.create(ReferenceValueType.SKILL, request.getSkillName(), userId)
                    );
                    return null;
                });

        if (skill == null) {
            throw new ReferenceValueSuggestionPendingException(
                    "Kỹ năng '" + request.getSkillName() + "' chưa có trong hệ thống. " +
                            "Đã gửi đề xuất bổ sung, vui lòng chờ admin duyệt."
            );
        }

        CandidateSkill cs = CandidateSkill.builder()
                .candidateId(profile.getId())
                .skillId(skill.getId())
                .level(request.getLevel())
                .note(request.getDescription())
                .yearsOfEx(0)
                .build();

        candidateSkillRepository.save(cs);

        return CandidateSkillResponse.builder()
                .id(skill.getId())
                .skillName(skill.getName())
                .level(cs.getLevel())
                .yearsOfEx(cs.getYearsOfEx())
                .description(cs.getNote())
                .build();
    }

    @Override
    public CandidateSkillResponse updateSkill(Long userId, Long skillId, CandidateSkillRequest request) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hồ sơ ứng viên."));

        ReferenceValue targetSkill = referenceValueRepository
                .findByTypeAndNameIgnoreCase(ReferenceValueType.SKILL, request.getSkillName())
                .orElseGet(() -> {
                    referenceValueSuggestionRepository.save(
                            ReferenceValueSuggestion.create(ReferenceValueType.SKILL, request.getSkillName(), userId)
                    );
                    return null;
                });

        if (targetSkill == null) {
            throw new ReferenceValueSuggestionPendingException(
                    "Kỹ năng '" + request.getSkillName() + "' chưa có trong hệ thống. " +
                            "Đã gửi đề xuất bổ sung, vui lòng chờ admin duyệt."
            );
        }

        CandidateSkill oldCs = candidateSkillRepository.findByCandidateIdAndSkillId(profile.getId(), skillId)
                .orElseThrow(() -> new IllegalArgumentException("Kỹ năng này chưa được thêm vào hồ sơ."));

        if (!oldCs.getSkillId().equals(targetSkill.getId())) {
            candidateSkillRepository.deleteByCandidateIdAndSkillId(profile.getId(), skillId);
        }

        CandidateSkill newCs = CandidateSkill.builder()
                .candidateId(profile.getId())
                .skillId(targetSkill.getId())
                .level(request.getLevel())
                .note(request.getDescription())
                .yearsOfEx(oldCs.getYearsOfEx())
                .build();

        candidateSkillRepository.save(newCs);

        return CandidateSkillResponse.builder()
                .id(targetSkill.getId())
                .skillName(targetSkill.getName())
                .level(newCs.getLevel())
                .yearsOfEx(newCs.getYearsOfEx())
                .description(newCs.getNote())
                .build();
    }

    @Override
    public void addSkillToCandidate(Long userId, Long skillId) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hồ sơ ứng viên."));
        referenceValueRepository.findById(skillId)
                .orElseThrow(() -> new IllegalArgumentException("Kỹ năng không tồn tại."));
        CandidateSkill cs = new CandidateSkill(profile.getId(), skillId);
        candidateSkillRepository.save(cs);
    }

    @Override
    public void removeSkillFromCandidate(Long userId, Long skillId) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hồ sơ ứng viên."));
        candidateSkillRepository.deleteByCandidateIdAndSkillId(profile.getId(), skillId);
    }

    @Override
    public CvDocumentResponse renameCv(Long userId, Long cvId, String newName) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hồ sơ ứng viên."));

        CvDocument cv = cvDocumentRepository.findById(cvId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy CV."));

        if (!cv.getCandidateId().equals(profile.getId())) {
            throw new IllegalArgumentException("Bạn không có quyền sửa CV này.");
        }

        cv.rename(newName);

        return mapToCvResponse(cvDocumentRepository.save(cv));
    }

    // ====================================================
    // PRIVATE HELPERS
    // ====================================================

    private List<String> syncSkillsFromCsv(Long candidateId, String csvSkills) {
        List<String> skipped = new ArrayList<>();
        if (csvSkills == null || csvSkills.trim().isEmpty()) return skipped;

        candidateSkillRepository.deleteByCandidateId(candidateId);

        for (String skillName : csvSkills.split(",")) {
            String trimmed = skillName.trim();
            if (trimmed.isEmpty()) continue;

            Optional<ReferenceValue> skill = referenceValueRepository
                    .findByTypeAndNameIgnoreCase(ReferenceValueType.SKILL, trimmed);

            if (skill.isEmpty()) {
                // Không tự tạo — chỉ đề xuất, admin duyệt sau. Không gán vào candidate_skills.
                referenceValueSuggestionRepository.save(
                        ReferenceValueSuggestion.create(ReferenceValueType.SKILL, trimmed, candidateId)
                );
                log.info("Skill '{}' chưa tồn tại, đã tạo suggestion PENDING, bỏ qua gán cho candidateId={}",
                        trimmed, candidateId);
                skipped.add(trimmed);
                continue;
            }

            candidateSkillRepository.save(new CandidateSkill(candidateId, skill.get().getId()));
        }
        return skipped;
    }

    // [SỬA] Cập nhật thêm các field mới vào response
    private CandidateProfileResponse mapToProfileResponse(CandidateProfile profile) {
        return CandidateProfileResponse.builder()
                .id(profile.getId())
                .userId(profile.getUserId())
                .fullName(profile.getFullName())
                .avatarUrl(profile.getAvatarUrl())
                .headline(profile.getHeadline())
                .phone(profile.getPhone())
                .emailContact(profile.getEmailContact())
                .gender(profile.getGender())
                .dob(profile.getDob())
                .address(profile.getAddress())
                .websiteUrl(profile.getWebsiteUrl())
                .linkedinUrl(profile.getLinkedinUrl())
                .githubUrl(profile.getGithubUrl())
                .summary(profile.getSummary())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<CandidateProfileResponse> searchCandidates(String keyword, DomainPageable pageable) {
        DomainPage<CandidateProfile> page = candidateProfileRepository.searchCandidates(keyword, pageable);

        return PageResponse.<CandidateProfileResponse>builder()
                .content(page.getContent().stream().map(profile -> {
                    List<String> skills = candidateSkillRepository.findByCandidateId(profile.getId()).stream()
                            .map(cs -> referenceValueRepository.findById(cs.getSkillId())
                                    .map(ReferenceValue::getName).orElse(""))
                            .filter(name -> !name.isEmpty())
                            .collect(Collectors.toList());

                    // Sử dụng luôn hàm mapToProfileResponse đã được khai báo ở trên
                    CandidateProfileResponse response = mapToProfileResponse(profile);
                    response.setSkills(skills); // Gán thêm list skills
                    return response;
                }).collect(Collectors.toList()))
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .pageNumber(page.getPageNumber())
                .pageSize(page.getPageSize())
                .build();
    }

    private CvDocumentResponse mapToCvResponse(CvDocument cv) {
        String finalFileName = (cv.getFileName() != null && !cv.getFileName().isEmpty())
                ? cv.getFileName()
                : "CV_Ban_Thao";

        if (finalFileName.equals("CV_Ban_Thao") && cv.getFilePath() != null) {
            String[] parts = cv.getFilePath().split("/");
            finalFileName = parts[parts.length - 1];
        }

        return CvDocumentResponse.builder()
                .id(cv.getId())
                .candidateId(cv.getCandidateId())
                .filePath(cv.getFilePath())
                .fileName(finalFileName)
                .thumbnailPath(cv.getThumbnailPath())
                .rawText(cv.getRawText())
                .isGenerated(cv.getIsGenerated())
                .createdAt(cv.getCreatedAt())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public CvDocumentResponse getCvDetail(Long userId, Long cvId) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hồ sơ ứng viên."));

        CvDocument cv = cvDocumentRepository.findById(cvId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy CV với ID: " + cvId));

        if (!cv.getCandidateId().equals(profile.getId())) {
            throw new IllegalArgumentException("Bạn không có quyền truy cập CV này.");
        }

        return mapToCvResponse(cv);
    }

    @Override
    public CvDocumentResponse updateGeneratedCv(Long userId, Long cvId, String rawText) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Yêu cầu tạo hồ sơ cá nhân."));

        CvDocument cv = cvDocumentRepository.findById(cvId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy CV."));

        if (!cv.getCandidateId().equals(profile.getId())) {
            throw new IllegalArgumentException("Bạn không có quyền sửa CV này.");
        }

        cv.updateRawText(rawText);
        return mapToCvResponse(cvDocumentRepository.save(cv));
    }

    @Override
    public CvDocumentResponse uploadCvThumbnail(Long userId, Long cvId, MultipartFile file) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hồ sơ ứng viên."));

        CvDocument cv = cvDocumentRepository.findById(cvId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy CV."));

        if (!cv.getCandidateId().equals(profile.getId())) {
            throw new IllegalArgumentException("Bạn không có quyền sửa CV này.");
        }

        String customFileName = cvId + ".jpg";

        String savedRelativePath = fileStoragePort.storeFile(file, "cv_thumbnails", String.valueOf(userId), customFileName);
        String thumbnailPath = "/uploads/" + savedRelativePath;

        cv.updateThumbnail(thumbnailPath);
        return mapToCvResponse(cvDocumentRepository.save(cv));
    }

    @Override
    @Transactional(readOnly = true)
    public List<EducationResponse> getEducationsByUserId(Long userId) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hồ sơ ứng viên."));
        return educationRepository.findByCandidateId(profile.getId()).stream()
                .map(this::mapToEducationResponse)
                .collect(Collectors.toList());
    }

    @Override
    public EducationResponse createEducation(Long userId, EducationRequest request) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hồ sơ ứng viên."));

        Education education = Education.create(profile.getId(), request.getSchoolName());
        education.updateDetails(request.getSchoolName(), request.getMajor(), request.getDegree(),
                request.getStartDate(), request.getEndDate(), request.isCurrent(),
                request.getGpa(), request.getDescription(), request.getDisplayOrder());

        return mapToEducationResponse(educationRepository.save(education));
    }

    @Override
    public EducationResponse updateEducation(Long userId, Long educationId, EducationRequest request) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hồ sơ ứng viên."));

        Education education = educationRepository.findById(educationId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy học vấn."));

        if (!education.getCandidateId().equals(profile.getId())) {
            throw new IllegalArgumentException("Bạn không có quyền sửa mục học vấn này.");
        }

        education.updateDetails(request.getSchoolName(), request.getMajor(), request.getDegree(),
                request.getStartDate(), request.getEndDate(), request.isCurrent(),
                request.getGpa(), request.getDescription(), request.getDisplayOrder());

        return mapToEducationResponse(educationRepository.save(education));
    }

    @Override
    public void deleteEducation(Long userId, Long educationId) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hồ sơ ứng viên."));

        Education education = educationRepository.findById(educationId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy học vấn."));

        if (!education.getCandidateId().equals(profile.getId())) {
            throw new IllegalArgumentException("Bạn không có quyền xóa mục học vấn này.");
        }
        educationRepository.deleteById(educationId);
    }

    private EducationResponse mapToEducationResponse(Education e) {
        return EducationResponse.builder()
                .id(e.getId())
                .schoolName(e.getSchoolName())
                .major(e.getMajor())
                .degree(e.getDegree())
                .startDate(e.getStartDate())
                .endDate(e.getEndDate())
                .isCurrent(e.isCurrent())
                .gpa(e.getGpa())
                .description(e.getDescription())
                .displayOrder(e.getDisplayOrder())
                .build();
    }

    // ==========================================
    // CRUD EXPERIENCE
    // ==========================================
    @Override
    @Transactional(readOnly = true)
    public List<ExperienceResponse> getExperiencesByUserId(Long userId) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hồ sơ ứng viên."));
        return experienceRepository.findByCandidateId(profile.getId()).stream()
                .map(this::mapToExperienceResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ExperienceResponse createExperience(Long userId, ExperienceRequest request) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hồ sơ ứng viên."));
        Experience experience = Experience.create(profile.getId(), request.getCompanyName());
        experience.updateDetails(request.getCompanyName(), request.getPosition(), request.getEmploymentType(),
                request.getLocation(), request.getStartDate(), request.getEndDate(), request.isCurrent(),
                request.getDescription(), request.getDisplayOrder());
        return mapToExperienceResponse(experienceRepository.save(experience));
    }

    @Override
    public ExperienceResponse updateExperience(Long userId, Long experienceId, ExperienceRequest request) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hồ sơ ứng viên."));
        Experience experience = experienceRepository.findById(experienceId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy kinh nghiệm làm việc."));
        if (!experience.getCandidateId().equals(profile.getId())) {
            throw new IllegalArgumentException("Bạn không có quyền sửa mục kinh nghiệm này.");
        }
        experience.updateDetails(request.getCompanyName(), request.getPosition(), request.getEmploymentType(),
                request.getLocation(), request.getStartDate(), request.getEndDate(), request.isCurrent(),
                request.getDescription(), request.getDisplayOrder());
        return mapToExperienceResponse(experienceRepository.save(experience));
    }

    @Override
    public void deleteExperience(Long userId, Long experienceId) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hồ sơ ứng viên."));
        Experience experience = experienceRepository.findById(experienceId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy kinh nghiệm làm việc."));
        if (!experience.getCandidateId().equals(profile.getId())) {
            throw new IllegalArgumentException("Bạn không có quyền xóa mục kinh nghiệm này.");
        }
        experienceRepository.deleteById(experienceId);
    }

    private ExperienceResponse mapToExperienceResponse(Experience e) {
        return ExperienceResponse.builder()
                .id(e.getId())
                .companyName(e.getCompanyName())
                .position(e.getPosition())
                .employmentType(e.getEmploymentType())
                .location(e.getLocation())
                .startDate(e.getStartDate())
                .endDate(e.getEndDate())
                .isCurrent(e.isCurrent())
                .description(e.getDescription())
                .displayOrder(e.getDisplayOrder())
                .build();
    }

    // ==========================================
    // CRUD PROJECT
    // ==========================================
    @Override
    @Transactional(readOnly = true)
    public List<ProjectResponse> getProjectsByUserId(Long userId) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hồ sơ ứng viên."));
        return projectRepository.findByCandidateId(profile.getId()).stream()
                .map(this::mapToProjectResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ProjectResponse createProject(Long userId, ProjectRequest request) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hồ sơ ứng viên."));
        Project project = Project.create(profile.getId(), request.getProjectName());
        project.updateDetails(request.getProjectName(), request.getRole(), request.getTechStack(),
                request.getProjectUrl(), request.getStartDate(), request.getEndDate(), request.isCurrent(),
                request.getDescription(), request.getDisplayOrder());
        return mapToProjectResponse(projectRepository.save(project));
    }

    @Override
    public ProjectResponse updateProject(Long userId, Long projectId, ProjectRequest request) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hồ sơ ứng viên."));
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy dự án."));
        if (!project.getCandidateId().equals(profile.getId())) {
            throw new IllegalArgumentException("Bạn không có quyền sửa mục dự án này.");
        }
        project.updateDetails(request.getProjectName(), request.getRole(), request.getTechStack(),
                request.getProjectUrl(), request.getStartDate(), request.getEndDate(), request.isCurrent(),
                request.getDescription(), request.getDisplayOrder());
        return mapToProjectResponse(projectRepository.save(project));
    }

    @Override
    public void deleteProject(Long userId, Long projectId) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hồ sơ ứng viên."));
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy dự án."));
        if (!project.getCandidateId().equals(profile.getId())) {
            throw new IllegalArgumentException("Bạn không có quyền xóa mục dự án này.");
        }
        projectRepository.deleteById(projectId);
    }

    private ProjectResponse mapToProjectResponse(Project p) {
        return ProjectResponse.builder()
                .id(p.getId())
                .projectName(p.getProjectName())
                .role(p.getRole())
                .techStack(p.getTechStack())
                .projectUrl(p.getProjectUrl())
                .startDate(p.getStartDate())
                .endDate(p.getEndDate())
                .isCurrent(p.isCurrent())
                .description(p.getDescription())
                .displayOrder(p.getDisplayOrder())
                .build();
    }

    // ==========================================
    // CRUD CERTIFICATION
    // ==========================================
    @Override
    @Transactional(readOnly = true)
    public List<CertificationResponse> getCertificationsByUserId(Long userId) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hồ sơ ứng viên."));
        return certificationRepository.findByCandidateId(profile.getId()).stream()
                .map(this::mapToCertificationResponse)
                .collect(Collectors.toList());
    }

    @Override
    public CertificationResponse createCertification(Long userId, CertificationRequest request) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hồ sơ ứng viên."));
        Certification cert = Certification.create(profile.getId(), request.getName());
        cert.updateDetails(request.getName(), request.getIssuingOrg(), request.getIssueDate(),
                request.getExpiryDate(), request.getCredentialId(), request.getCredentialUrl(), request.getDisplayOrder());
        return mapToCertificationResponse(certificationRepository.save(cert));
    }

    @Override
    public CertificationResponse updateCertification(Long userId, Long certificationId, CertificationRequest request) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hồ sơ ứng viên."));
        Certification cert = certificationRepository.findById(certificationId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy chứng chỉ."));
        if (!cert.getCandidateId().equals(profile.getId())) {
            throw new IllegalArgumentException("Bạn không có quyền sửa chứng chỉ này.");
        }
        cert.updateDetails(request.getName(), request.getIssuingOrg(), request.getIssueDate(),
                request.getExpiryDate(), request.getCredentialId(), request.getCredentialUrl(), request.getDisplayOrder());
        return mapToCertificationResponse(certificationRepository.save(cert));
    }

    @Override
    public void deleteCertification(Long userId, Long certificationId) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hồ sơ ứng viên."));
        Certification cert = certificationRepository.findById(certificationId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy chứng chỉ."));
        if (!cert.getCandidateId().equals(profile.getId())) {
            throw new IllegalArgumentException("Bạn không có quyền xóa chứng chỉ này.");
        }
        certificationRepository.deleteById(certificationId);
    }

    private CertificationResponse mapToCertificationResponse(Certification c) {
        return CertificationResponse.builder()
                .id(c.getId())
                .name(c.getName())
                .issuingOrg(c.getIssuingOrg())
                .issueDate(c.getIssueDate())
                .expiryDate(c.getExpiryDate())
                .credentialId(c.getCredentialId())
                .credentialUrl(c.getCredentialUrl())
                .displayOrder(c.getDisplayOrder())
                .build();
    }

    // ==========================================
    // CRUD ACTIVITY
    // ==========================================
    @Override
    @Transactional(readOnly = true)
    public List<ActivityResponse> getActivitiesByUserId(Long userId) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hồ sơ ứng viên."));
        return activityRepository.findByCandidateId(profile.getId()).stream()
                .map(this::mapToActivityResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ActivityResponse createActivity(Long userId, ActivityRequest request) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hồ sơ ứng viên."));
        Activity activity = Activity.create(profile.getId(), request.getOrganization());
        activity.updateDetails(request.getOrganization(), request.getRole(), request.getStartDate(),
                request.getEndDate(), request.isCurrent(), request.getDescription(), request.getDisplayOrder());
        return mapToActivityResponse(activityRepository.save(activity));
    }

    @Override
    public ActivityResponse updateActivity(Long userId, Long activityId, ActivityRequest request) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hồ sơ ứng viên."));
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hoạt động."));
        if (!activity.getCandidateId().equals(profile.getId())) {
            throw new IllegalArgumentException("Bạn không có quyền sửa hoạt động này.");
        }
        activity.updateDetails(request.getOrganization(), request.getRole(), request.getStartDate(),
                request.getEndDate(), request.isCurrent(), request.getDescription(), request.getDisplayOrder());
        return mapToActivityResponse(activityRepository.save(activity));
    }

    @Override
    public void deleteActivity(Long userId, Long activityId) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hồ sơ ứng viên."));
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hoạt động."));
        if (!activity.getCandidateId().equals(profile.getId())) {
            throw new IllegalArgumentException("Bạn không có quyền xóa hoạt động này.");
        }
        activityRepository.deleteById(activityId);
    }

    private ActivityResponse mapToActivityResponse(Activity a) {
        return ActivityResponse.builder()
                .id(a.getId())
                .organization(a.getOrganization())
                .role(a.getRole())
                .startDate(a.getStartDate())
                .endDate(a.getEndDate())
                .isCurrent(a.isCurrent())
                .description(a.getDescription())
                .displayOrder(a.getDisplayOrder())
                .build();
    }

    // ==========================================
    // CRUD AWARD
    // ==========================================
    @Override
    @Transactional(readOnly = true)
    public List<AwardResponse> getAwardsByUserId(Long userId) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hồ sơ ứng viên."));
        return awardRepository.findByCandidateId(profile.getId()).stream()
                .map(this::mapToAwardResponse)
                .collect(Collectors.toList());
    }

    @Override
    public AwardResponse createAward(Long userId, AwardRequest request) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hồ sơ ứng viên."));
        Award award = Award.create(profile.getId(), request.getTitle());
        award.updateDetails(request.getTitle(), request.getIssuer(), request.getAwardedDate(),
                request.getDescription(), request.getDisplayOrder());
        return mapToAwardResponse(awardRepository.save(award));
    }

    @Override
    public AwardResponse updateAward(Long userId, Long awardId, AwardRequest request) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hồ sơ ứng viên."));
        Award award = awardRepository.findById(awardId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy giải thưởng."));
        if (!award.getCandidateId().equals(profile.getId())) {
            throw new IllegalArgumentException("Bạn không có quyền sửa giải thưởng này.");
        }
        award.updateDetails(request.getTitle(), request.getIssuer(), request.getAwardedDate(),
                request.getDescription(), request.getDisplayOrder());
        return mapToAwardResponse(awardRepository.save(award));
    }

    @Override
    public void deleteAward(Long userId, Long awardId) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hồ sơ ứng viên."));
        Award award = awardRepository.findById(awardId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy giải thưởng."));
        if (!award.getCandidateId().equals(profile.getId())) {
            throw new IllegalArgumentException("Bạn không có quyền xóa giải thưởng này.");
        }
        awardRepository.deleteById(awardId);
    }

    private AwardResponse mapToAwardResponse(Award a) {
        return AwardResponse.builder()
                .id(a.getId())
                .title(a.getTitle())
                .issuer(a.getIssuer())
                .awardedDate(a.getAwardedDate())
                .description(a.getDescription())
                .displayOrder(a.getDisplayOrder())
                .build();
    }

    // ==========================================
    // CRUD HOBBY
    // ==========================================
    @Override
    @Transactional(readOnly = true)
    public List<HobbyResponse> getHobbiesByUserId(Long userId) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hồ sơ ứng viên."));
        return hobbyRepository.findByCandidateId(profile.getId()).stream()
                .map(this::mapToHobbyResponse)
                .collect(Collectors.toList());
    }

    @Override
    public HobbyResponse createHobby(Long userId, HobbyRequest request) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hồ sơ ứng viên."));
        Hobby hobby = Hobby.create(profile.getId(), request.getName());
        hobby.updateDetails(request.getName(), request.getDisplayOrder());
        return mapToHobbyResponse(hobbyRepository.save(hobby));
    }

    @Override
    public HobbyResponse updateHobby(Long userId, Long hobbyId, HobbyRequest request) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hồ sơ ứng viên."));
        Hobby hobby = hobbyRepository.findById(hobbyId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy sở thích."));
        if (!hobby.getCandidateId().equals(profile.getId())) {
            throw new IllegalArgumentException("Bạn không có quyền sửa sở thích này.");
        }
        hobby.updateDetails(request.getName(), request.getDisplayOrder());
        return mapToHobbyResponse(hobbyRepository.save(hobby));
    }

    @Override
    public void deleteHobby(Long userId, Long hobbyId) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hồ sơ ứng viên."));
        Hobby hobby = hobbyRepository.findById(hobbyId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy sở thích."));
        if (!hobby.getCandidateId().equals(profile.getId())) {
            throw new IllegalArgumentException("Bạn không có quyền xóa sở thích này.");
        }
        hobbyRepository.deleteById(hobbyId);
    }

    private HobbyResponse mapToHobbyResponse(Hobby h) {
        return HobbyResponse.builder()
                .id(h.getId())
                .name(h.getName())
                .displayOrder(h.getDisplayOrder())
                .build();
    }

    // ==========================================
    // CRUD LANGUAGE
    // ==========================================
    @Override
    @Transactional(readOnly = true)
    public List<LanguageResponse> getLanguagesByUserId(Long userId) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hồ sơ ứng viên."));
        return languageRepository.findByCandidateId(profile.getId()).stream()
                .map(this::mapToLanguageResponse)
                .collect(Collectors.toList());
    }

    @Override
    public LanguageResponse createLanguage(Long userId, LanguageRequest request) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hồ sơ ứng viên."));

        ReferenceValue languageRef = referenceValueRepository.findById(request.getLanguageId())
                .orElseThrow(() -> new IllegalArgumentException("Ngôn ngữ không hợp lệ."));
        if (!ReferenceValueType.LANGUAGE.equalsIgnoreCase(languageRef.getType())) {
            throw new IllegalArgumentException("ReferenceValue này không thuộc type LANGUAGE.");
        }

        Language language = Language.create(
                profile.getId(), request.getLanguageId(), request.getProficiency(), request.getDisplayOrder()
        );
        return mapToLanguageResponse(languageRepository.save(language));
    }

    @Override
    public LanguageResponse updateLanguage(Long userId, Long languageId, LanguageRequest request) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hồ sơ ứng viên."));
        Language language = languageRepository.findById(languageId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy ngoại ngữ."));
        if (!language.getCandidateId().equals(profile.getId())) {
            throw new IllegalArgumentException("Bạn không có quyền sửa ngoại ngữ này.");
        }

        ReferenceValue languageRef = referenceValueRepository.findById(request.getLanguageId())
                .orElseThrow(() -> new IllegalArgumentException("Ngôn ngữ không hợp lệ."));
        if (!ReferenceValueType.LANGUAGE.equalsIgnoreCase(languageRef.getType())) {
            throw new IllegalArgumentException("ReferenceValue này không thuộc type LANGUAGE.");
        }

        language.changeLanguage(request.getLanguageId());
        language.changeProficiency(request.getProficiency());
        language.changeDisplayOrder(request.getDisplayOrder());

        return mapToLanguageResponse(languageRepository.save(language));
    }

    @Override
    public void deleteLanguage(Long userId, Long languageId) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hồ sơ ứng viên."));
        Language language = languageRepository.findById(languageId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy ngoại ngữ."));
        if (!language.getCandidateId().equals(profile.getId())) {
            throw new IllegalArgumentException("Bạn không có quyền xóa ngoại ngữ này.");
        }
        languageRepository.deleteById(languageId);
    }

    private LanguageResponse mapToLanguageResponse(Language l) {
        String languageName = referenceValueRepository.findById(l.getLanguageId())
                .map(ReferenceValue::getName)
                .orElse("Không xác định");

        return LanguageResponse.builder()
                .id(l.getId())
                .languageId(l.getLanguageId())
                .languageName(languageName)
                .proficiency(l.getProficiency())
                .displayOrder(l.getDisplayOrder())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReferenceValueResponse> searchReferenceValues(String type, String keyword) {
        return referenceValueRepository.searchByTypeAndKeyword(type, keyword == null ? "" : keyword).stream()
                .map(rv -> ReferenceValueResponse.builder()
                        .id(rv.getId())
                        .type(rv.getType())
                        .name(rv.getName())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public SuggestionResponse suggestReferenceValue(Long userId, String type, String name) {
        Optional<ReferenceValue> existing = referenceValueRepository.findByTypeAndNameIgnoreCase(type, name);
        if (existing.isPresent()) {
            throw new IllegalArgumentException("'" + name + "' đã tồn tại trong hệ thống, không cần đề xuất.");
        }

        ReferenceValueSuggestion suggestion = referenceValueSuggestionRepository.save(
                ReferenceValueSuggestion.create(type, name, userId)
        );

        return SuggestionResponse.builder()
                .id(suggestion.getId())
                .type(suggestion.getType())
                .name(suggestion.getName())
                .requestedByUserId(suggestion.getRequestedByUserId())
                .status(suggestion.getStatus())
                .createdAt(suggestion.getCreatedAt())
                .build();
    }

    @Override
    @Transactional
    public List<ProfileLayoutItemResponse> getProfileLayout(Long userId) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hồ sơ ứng viên."));

        return getOrInitLayout(profile.getId()).stream()
                .sorted(Comparator.comparingInt(CandidateProfileLayout::getPosition))
                .map(this::mapToLayoutResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProfileLayoutItemResponse> reorderProfileLayout(Long userId, ProfileLayoutReorderRequest request) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hồ sơ ứng viên."));

        List<CandidateProfileLayout> layouts = getOrInitLayout(profile.getId());
        Map<BlockType, CandidateProfileLayout> byType = layouts.stream()
                .collect(Collectors.toMap(CandidateProfileLayout::getBlockType, l -> l));

        for (LayoutPositionItem item : request.getItems()) {
            BlockType type = parseBlockType(item.getBlockType());
            CandidateProfileLayout layout = byType.get(type);
            if (layout == null) {
                throw new IllegalArgumentException("Block không hợp lệ: " + item.getBlockType());
            }
            layout.reorder(item.getPosition());
        }

        List<CandidateProfileLayout> saved = candidateProfileLayoutRepository.saveAll(layouts);
        return saved.stream()
                .sorted(Comparator.comparingInt(CandidateProfileLayout::getPosition))
                .map(this::mapToLayoutResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ProfileLayoutItemResponse toggleBlockVisibility(Long userId, String blockType, boolean visible) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hồ sơ ứng viên."));

        BlockType type = parseBlockType(blockType);
        List<CandidateProfileLayout> layouts = getOrInitLayout(profile.getId());
        CandidateProfileLayout target = layouts.stream()
                .filter(l -> l.getBlockType() == type)
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Block không hợp lệ: " + blockType));

        target.toggleVisibility(visible);
        candidateProfileLayoutRepository.saveAll(List.of(target));
        return mapToLayoutResponse(target);
    }

    // Lấy layout hiện có; nếu candidate chưa từng có layout (mở ProfilePage lần đầu) thì khởi tạo mặc định
    private List<CandidateProfileLayout> getOrInitLayout(Long candidateId) {
        if (!candidateProfileLayoutRepository.existsByCandidateId(candidateId)) {
            return candidateProfileLayoutRepository.saveAll(CandidateProfileLayout.defaultFor(candidateId));
        }
        return candidateProfileLayoutRepository.findByCandidateId(candidateId);
    }

    private BlockType parseBlockType(String raw) {
        try {
            return BlockType.valueOf(raw.trim().toUpperCase());
        } catch (Exception e) {
            throw new IllegalArgumentException("blockType không hợp lệ: " + raw);
        }
    }

    private ProfileLayoutItemResponse mapToLayoutResponse(CandidateProfileLayout layout) {
        return ProfileLayoutItemResponse.builder()
                .blockType(layout.getBlockType().name())
                .position(layout.getPosition())
                .visible(layout.isVisible())
                .repeatable(layout.getBlockType().isRepeatable())
                .build();
    }
}