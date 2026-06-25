package com.worklify.application.candidate.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.worklify.application.candidate.dto.*;
import com.worklify.application.candidate.service.CandidateService;
import com.worklify.application.common.dto.PageResponse;
import com.worklify.application.common.port.FileStoragePort;
import com.worklify.domain.auth.repository.UserRepository;
import com.worklify.domain.candidate.model.CandidateProfile;
import com.worklify.domain.candidate.model.CandidateSkill;
import com.worklify.domain.candidate.model.CvDocument;
import com.worklify.domain.candidate.model.Skill;
import com.worklify.domain.candidate.repository.CandidateProfileRepository;
import com.worklify.domain.candidate.repository.CandidateSkillRepository;
import com.worklify.domain.candidate.repository.CvDocumentRepository;
import com.worklify.domain.candidate.repository.SkillRepository;
import com.worklify.domain.common.DomainPage;
import com.worklify.domain.common.DomainPageable;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class CandidateServiceImpl implements CandidateService {

    private final CandidateProfileRepository candidateProfileRepository;
    private final CvDocumentRepository cvDocumentRepository;
    private final CandidateSkillRepository candidateSkillRepository;
    private final SkillRepository skillRepository;
    private final FileStoragePort fileStoragePort;
    private final ObjectMapper objectMapper;

    @Override
    public CandidateProfileResponse createProfile(Long userId, CandidateProfileRequest request) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseGet(() -> CandidateProfile.create(userId, request.getFullName()));

        profile.updateProfileDetails(
                request.getFullName(),
                request.getPhone(),
                request.getGender(),
                request.getDob(),
                request.getAddress(),
                request.getSummary()
        );

        CandidateProfile saved = candidateProfileRepository.save(profile);

        // Đồng bộ kỹ năng từ chuỗi phân cách dấu phẩy (nếu có)
        syncSkillsFromCsv(saved.getId(), request.getSkills());

        return mapToProfileResponse(saved);
    }

    @Override
    public CandidateProfileResponse updateProfile(Long userId, CandidateProfileRequest request) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hồ sơ ứng viên."));

        profile.updateProfileDetails(
                request.getFullName(),
                request.getPhone(),
                request.getGender(),
                request.getDob(),
                request.getAddress(),
                request.getSummary()
        );

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

    @Override
    public CvDocumentResponse uploadCv(Long userId, MultipartFile file) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Yêu cầu tạo hồ sơ cá nhân trước khi tải CV lên."));

        String savedRelativePath = fileStoragePort.storeFile(file, "cv", String.valueOf(userId));
        String uploadedFilePath = "/uploads/" + savedRelativePath;
        String extractedText = "Extracted text from " + file.getOriginalFilename();

        // Cập nhật: Truyền thêm file.getOriginalFilename() vào tham số thứ 3
        CvDocument cv = CvDocument.upload(profile.getId(), uploadedFilePath, file.getOriginalFilename(), extractedText);

        return mapToCvResponse(cvDocumentRepository.save(cv));
    }

    @Override
    public CvDocumentResponse saveGeneratedCv(Long userId, String rawText) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Yêu cầu tạo hồ sơ cá nhân trước khi lưu bản thảo CV."));

        Long candidateId = profile.getId();

        // SỬA: Thêm tham số "CV_Tu_Tao" (hoặc tên mặc định bạn muốn) làm tham số thứ 2
        CvDocument cv = CvDocument.generate(candidateId, "CV_Tu_Tao", rawText);
        CvDocument saved = cvDocumentRepository.save(cv);

        // ... phần logic còn lại giữ nguyên
        try {
            List<Map<String, Object>> blocks = objectMapper.readValue(
                    rawText, new TypeReference<List<Map<String, Object>>>() {}
            );
            // ...
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
                    Skill skill = skillRepository.findById(cs.getSkillId())
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

        Skill skill = skillRepository.findByNameIgnoreCase(request.getSkillName())
                .orElseGet(() -> skillRepository.save(Skill.create(request.getSkillName())));

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

        Skill targetSkill = skillRepository.findByNameIgnoreCase(request.getSkillName())
                .orElseGet(() -> skillRepository.save(Skill.create(request.getSkillName())));

        CandidateSkill oldCs = candidateSkillRepository.findByCandidateIdAndSkillId(profile.getId(), skillId)
                .orElseThrow(() -> new IllegalArgumentException("Kỹ năng này chưa được thêm vào hồ sơ."));

        // Nếu tên kỹ năng thay đổi, xóa bản ghi cũ
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
        skillRepository.findById(skillId)
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

    // Thêm vào com.worklify.application.candidate.service.impl.CandidateServiceImpl[cite: 5]
    @Override
    public CvDocumentResponse renameCv(Long userId, Long cvId, String newName) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hồ sơ ứng viên."));

        CvDocument cv = cvDocumentRepository.findById(cvId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy CV."));

        if (!cv.getCandidateId().equals(profile.getId())) {
            throw new IllegalArgumentException("Bạn không có quyền sửa CV này.");
        }

        // Cập nhật tên thông qua phương thức domain (bạn cần đảm bảo class CvDocument có phương thức rename)
        cv.rename(newName);

        return mapToCvResponse(cvDocumentRepository.save(cv));
    }

    // ====================================================
    // PRIVATE HELPERS
    // ====================================================

    /**
     * Đồng bộ kỹ năng từ chuỗi CSV vào bảng candidate_skills.
     * Xóa sạch kỹ năng cũ của candidate trước khi ghi mới.
     */
    private void syncSkillsFromCsv(Long candidateId, String csvSkills) {
        if (csvSkills == null || csvSkills.trim().isEmpty()) return;

        candidateSkillRepository.deleteByCandidateId(candidateId);

        for (String skillName : csvSkills.split(",")) {
            String trimmed = skillName.trim();
            if (trimmed.isEmpty()) continue;

            Skill skill = skillRepository.findByNameIgnoreCase(trimmed)
                    .orElseGet(() -> skillRepository.save(Skill.create(trimmed)));

            candidateSkillRepository.save(new CandidateSkill(candidateId, skill.getId()));
        }
    }

    private CandidateProfileResponse mapToProfileResponse(CandidateProfile profile) {
        return CandidateProfileResponse.builder()
                .id(profile.getId())
                .userId(profile.getUserId())
                .fullName(profile.getFullName())
                .phone(profile.getPhone())
                .gender(profile.getGender())
                .dob(profile.getDob())
                .address(profile.getAddress())
                .summary(profile.getSummary())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<CandidateProfileResponse> searchCandidates(String keyword, DomainPageable pageable) {
        DomainPage<CandidateProfile> page = candidateProfileRepository.searchCandidates(keyword, pageable);

        return PageResponse.<CandidateProfileResponse>builder()
                .content(page.getContent().stream().map(profile -> {
                    // Lấy danh sách tên kỹ năng của ứng viên này
                    List<String> skills = candidateSkillRepository.findByCandidateId(profile.getId()).stream()
                            .map(cs -> skillRepository.findById(cs.getSkillId()).map(Skill::getName).orElse(""))
                            .filter(name -> !name.isEmpty())
                            .collect(Collectors.toList());

                    return CandidateProfileResponse.builder()
                            .id(profile.getId())
                            .userId(profile.getUserId())
                            .fullName(profile.getFullName())
                            .phone(profile.getPhone())
                            .gender(profile.getGender())
                            .dob(profile.getDob())
                            .address(profile.getAddress())
                            .summary(profile.getSummary())
                            .skills(skills) // Truyền list skills vào DTO
                            .build();
                }).collect(Collectors.toList()))
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .pageNumber(page.getPageNumber())
                .pageSize(page.getPageSize())
                .build();
    }

    // Sửa hàm private trong CandidateServiceImpl.java
    // Sửa hàm private trong CandidateServiceImpl.java
    private CvDocumentResponse mapToCvResponse(CvDocument cv) {
        // Ưu tiên lấy fileName từ Domain (đã lưu trong DB), nếu null mới bóc tách từ path
        String finalFileName = (cv.getFileName() != null && !cv.getFileName().isEmpty())
                ? cv.getFileName()
                : "CV_Ban_Thao";

        // Nếu vẫn chưa có tên và có filePath, mới bóc tách từ path
        if (finalFileName.equals("CV_Ban_Thao") && cv.getFilePath() != null) {
            String[] parts = cv.getFilePath().split("/");
            finalFileName = parts[parts.length - 1];
        }

        return CvDocumentResponse.builder()
                .id(cv.getId())
                .candidateId(cv.getCandidateId())
                .filePath(cv.getFilePath())
                .fileName(finalFileName)
                .rawText(cv.getRawText()) // <--- DÒNG CỰC KỲ QUAN TRỌNG ĐỂ FRONTEND CÓ THỂ ĐỌC ĐƯỢC JSON
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

        // Kiểm tra quyền sở hữu
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
}