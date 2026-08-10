package com.worklify.api.controller.candidate;

import com.worklify.api.common.response.ApiResponse;
import com.worklify.application.candidate.dto.*;
import com.worklify.application.candidate.service.CandidateService;
import com.worklify.application.common.dto.PageResponse;
import com.worklify.application.referencedata.dto.ReferenceValueResponse;
import com.worklify.application.referencedata.dto.SuggestionRequest;
import com.worklify.application.referencedata.dto.SuggestionResponse;
import com.worklify.domain.common.DomainPageable;
import com.worklify.domain.common.SearchPageable;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/candidates")
@RequiredArgsConstructor
@Tag(name = "2. Candidate", description = "Quản lý hồ sơ và CV của Ứng viên")
@PreAuthorize("hasRole('CANDIDATE')")
public class CandidateController {

    private final CandidateService candidateService;

    // ==========================================
    // 1. QUẢN LÝ THÔNG TIN CÁ NHÂN (PROFILE)
    // ==========================================
    @PostMapping("/{userId}/profile")
    @Operation(summary = "Tạo mới hoặc cập nhật hồ sơ năng lực ứng viên")
    public ApiResponse<CandidateProfileResponse> createOrUpdateProfile(
            @PathVariable("userId") Long userId,
            @Valid @RequestBody CandidateProfileRequest request) {
        return ApiResponse.success(candidateService.createProfile(userId, request));
    }

    @GetMapping("/{userId}/profile")
    @Operation(summary = "Lấy thông tin hồ sơ ứng viên")
    public ApiResponse<CandidateProfileResponse> getProfile(@PathVariable("userId") Long userId) {
        return ApiResponse.success(candidateService.getProfileByUserId(userId));
    }

    // ==========================================
    // 2. QUẢN LÝ KỸ NĂNG (SKILLS) - [MỚI BỔ SUNG]
    // ==========================================
    @GetMapping("/{userId}/skills")
    @Operation(summary = "Lấy danh sách kỹ năng của ứng viên")
    public ApiResponse<List<CandidateSkillResponse>> getSkills(@PathVariable("userId") Long userId) {
        return ApiResponse.success(candidateService.getSkillsByUserId(userId));
    }

    @PostMapping("/{userId}/skills")
    @Operation(summary = "Thêm kỹ năng mới cho ứng viên")
    public ApiResponse<CandidateSkillResponse> createSkill(
            @PathVariable("userId") Long userId,
            @Valid @RequestBody CandidateSkillRequest request) {
        return ApiResponse.success(candidateService.createSkill(userId, request));
    }

    @PutMapping("/{userId}/skills/{skillId}")
    @Operation(summary = "Cập nhật kỹ năng của ứng viên")
    public ApiResponse<CandidateSkillResponse> updateSkill(
            @PathVariable("userId") Long userId,
            @PathVariable("skillId") Long skillId,
            @Valid @RequestBody CandidateSkillRequest request) {
        return ApiResponse.success(candidateService.updateSkill(userId, skillId, request));
    }

    // ==========================================
    // 3. QUẢN LÝ CV (FILE & SANDBOX)
    // ==========================================
    @PostMapping(value = "/{userId}/cvs", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Tải lên CV")
    public ApiResponse<CvDocumentResponse> uploadCv(
            @PathVariable("userId") Long userId,
            @RequestParam("file") MultipartFile file) throws IOException {

        // Truyền thẳng file nhận được xuống tầng service xử lý vật lý
        return ApiResponse.success(candidateService.uploadCv(userId, file), "Tải CV lên thành công");
    }

    @GetMapping("/{userId}/cvs")
    @Operation(summary = "Lấy danh sách CV đã lưu của ứng viên")
    public ApiResponse<List<CvDocumentResponse>> getCvs(@PathVariable("userId") Long userId) {
        // Hàm này gọi candidateService.getCvsByUserId(userId) hoặc getCvDocuments(userId)
        // Hãy chắc chắn tên hàm gọi ở đây khớp với service của bạn
        return ApiResponse.success(candidateService.getCvsByUserId(userId));
    }

    @PostMapping("/{userId}/cvs/generated")
    @Operation(summary = "Lưu cấu trúc CV tạo từ Sandbox (JSON)")
    public ApiResponse<CvDocumentResponse> saveGeneratedCv(
            @PathVariable("userId") Long userId,
            @Valid @RequestBody GeneratedCvRequest request) {
        return ApiResponse.success(candidateService.saveGeneratedCv(userId, request.getRawText()), "Lưu bản thảo CV thành công");
    }

    @GetMapping("/{userId}/cvs/generated/latest")
    @Operation(summary = "Lấy bản thảo CV Sandbox mới nhất")
    public ApiResponse<CvDocumentResponse> getLatestGeneratedCv(@PathVariable("userId") Long userId) {
        return ApiResponse.success(candidateService.getLatestGeneratedCv(userId));
    }

    @PutMapping("/{userId}/cvs/{cvId}/rename")
    @Operation(summary = "Đổi tên hiển thị của CV")
    public ApiResponse<CvDocumentResponse> renameCv(
            @PathVariable("userId") Long userId,
            @PathVariable("cvId") Long cvId,
            @RequestParam("newName") String newName) {
        return ApiResponse.success(candidateService.renameCv(userId, cvId, newName), "Đổi tên CV thành công");
    }

    // [ĐÃ BỔ SUNG] Endpoint xóa CV để xử lý lỗi 500 khi bấm nút Xóa trên Frontend
    @DeleteMapping("/{userId}/cvs/{cvId}")
    @Operation(summary = "Xóa CV của ứng viên")
    public ApiResponse<Void> deleteCv(
            @PathVariable("userId") Long userId,
            @PathVariable("cvId") Long cvId) {

        candidateService.deleteCv(userId, cvId);
        return ApiResponse.success(null, "Xóa CV thành công");
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('EMPLOYER', 'ADMIN')")
    @Operation(summary = "Tìm kiếm ứng viên (Dành cho Nhà tuyển dụng)")
    public ApiResponse<PageResponse<CandidateProfileResponse>> searchCandidates(
            @RequestParam(name = "keyword", required = false, defaultValue = "") String keyword,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {

        DomainPageable pageable = new SearchPageable(page, size);
        return ApiResponse.success(candidateService.searchCandidates(keyword, pageable));
    }

    @GetMapping("/{userId}/cvs/{cvId}")
    @Operation(summary = "Lấy chi tiết một CV của ứng viên")
    public ApiResponse<CvDocumentResponse> getCvDetail(
            @PathVariable("userId") Long userId,
            @PathVariable("cvId") Long cvId) {

        // Gọi service lấy chi tiết CV.
        // Lưu ý: Đảm bảo trong CandidateService của bạn đã có hàm getCvDetail (hoặc getCvById).
        return ApiResponse.success(candidateService.getCvDetail(userId, cvId));
    }

    @PutMapping("/{userId}/cvs/generated/{cvId}")
    @Operation(summary = "Cập nhật bản thảo CV Sandbox (JSON)")
    public ApiResponse<CvDocumentResponse> updateGeneratedCv(
            @PathVariable("userId") Long userId,
            @PathVariable("cvId") Long cvId,
            @Valid @RequestBody GeneratedCvRequest request) { // Dùng lại DTO GeneratedCvRequest
        return ApiResponse.success(candidateService.updateGeneratedCv(userId, cvId, request.getRawText()), "Cập nhật CV thành công");
    }

    @PostMapping(value = "/{userId}/cvs/{cvId}/thumbnail", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Tải lên ảnh thu nhỏ (Thumbnail) của CV")
    public ApiResponse<CvDocumentResponse> uploadCvThumbnail(
            @PathVariable("userId") Long userId,
            @PathVariable("cvId") Long cvId,
            @RequestParam("file") MultipartFile file) throws IOException {

        return ApiResponse.success(candidateService.uploadCvThumbnail(userId, cvId, file), "Lưu ảnh thu nhỏ thành công");
    }

    // ==========================================
    // 4. ẢNH ĐẠI DIỆN (AVATAR)
    // ==========================================
    @PostMapping(value = "/{userId}/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Tải lên ảnh đại diện ứng viên")
    public ApiResponse<CandidateProfileResponse> uploadAvatar(
            @PathVariable("userId") Long userId,
            @RequestParam("file") MultipartFile file) throws IOException {
        return ApiResponse.success(candidateService.uploadAvatar(userId, file), "Cập nhật ảnh đại diện thành công");
    }

    // ==========================================
    // 5. QUẢN LÝ HỌC VẤN (EDUCATIONS)
    // ==========================================
    @GetMapping("/{userId}/educations")
    @Operation(summary = "Lấy danh sách học vấn của ứng viên")
    public ApiResponse<List<EducationResponse>> getEducations(@PathVariable("userId") Long userId) {
        return ApiResponse.success(candidateService.getEducationsByUserId(userId));
    }

    @PostMapping("/{userId}/educations")
    @Operation(summary = "Thêm mục học vấn mới")
    public ApiResponse<EducationResponse> createEducation(
            @PathVariable("userId") Long userId,
            @Valid @RequestBody EducationRequest request) {
        return ApiResponse.success(candidateService.createEducation(userId, request), "Thêm học vấn thành công");
    }

    @PutMapping("/{userId}/educations/{educationId}")
    @Operation(summary = "Cập nhật mục học vấn")
    public ApiResponse<EducationResponse> updateEducation(
            @PathVariable("userId") Long userId,
            @PathVariable("educationId") Long educationId,
            @Valid @RequestBody EducationRequest request) {
        return ApiResponse.success(candidateService.updateEducation(userId, educationId, request), "Cập nhật học vấn thành công");
    }

    @DeleteMapping("/{userId}/educations/{educationId}")
    @Operation(summary = "Xóa mục học vấn")
    public ApiResponse<Void> deleteEducation(
            @PathVariable("userId") Long userId,
            @PathVariable("educationId") Long educationId) {
        candidateService.deleteEducation(userId, educationId);
        return ApiResponse.success(null, "Xóa học vấn thành công");
    }



    // ==========================================
    // 6. QUẢN LÝ KINH NGHIỆM LÀM VIỆC (EXPERIENCES)
    // ==========================================
    @GetMapping("/{userId}/experiences")
    @Operation(summary = "Lấy danh sách kinh nghiệm làm việc")
    public ApiResponse<List<ExperienceResponse>> getExperiences(@PathVariable("userId") Long userId) {
        return ApiResponse.success(candidateService.getExperiencesByUserId(userId));
    }

    @PostMapping("/{userId}/experiences")
    @Operation(summary = "Thêm kinh nghiệm làm việc mới")
    public ApiResponse<ExperienceResponse> createExperience(
            @PathVariable("userId") Long userId,
            @Valid @RequestBody ExperienceRequest request) {
        return ApiResponse.success(candidateService.createExperience(userId, request), "Thêm kinh nghiệm thành công");
    }

    @PutMapping("/{userId}/experiences/{experienceId}")
    @Operation(summary = "Cập nhật kinh nghiệm làm việc")
    public ApiResponse<ExperienceResponse> updateExperience(
            @PathVariable("userId") Long userId,
            @PathVariable("experienceId") Long experienceId,
            @Valid @RequestBody ExperienceRequest request) {
        return ApiResponse.success(candidateService.updateExperience(userId, experienceId, request), "Cập nhật kinh nghiệm thành công");
    }

    @DeleteMapping("/{userId}/experiences/{experienceId}")
    @Operation(summary = "Xóa kinh nghiệm làm việc")
    public ApiResponse<Void> deleteExperience(
            @PathVariable("userId") Long userId,
            @PathVariable("experienceId") Long experienceId) {
        candidateService.deleteExperience(userId, experienceId);
        return ApiResponse.success(null, "Xóa kinh nghiệm thành công");
    }

    // ==========================================
    // 7. QUẢN LÝ DỰ ÁN (PROJECTS)
    // ==========================================
    @GetMapping("/{userId}/projects")
    @Operation(summary = "Lấy danh sách dự án")
    public ApiResponse<List<ProjectResponse>> getProjects(@PathVariable("userId") Long userId) {
        return ApiResponse.success(candidateService.getProjectsByUserId(userId));
    }

    @PostMapping("/{userId}/projects")
    @Operation(summary = "Thêm dự án mới")
    public ApiResponse<ProjectResponse> createProject(
            @PathVariable("userId") Long userId,
            @Valid @RequestBody ProjectRequest request) {
        return ApiResponse.success(candidateService.createProject(userId, request), "Thêm dự án thành công");
    }

    @PutMapping("/{userId}/projects/{projectId}")
    @Operation(summary = "Cập nhật dự án")
    public ApiResponse<ProjectResponse> updateProject(
            @PathVariable("userId") Long userId,
            @PathVariable("projectId") Long projectId,
            @Valid @RequestBody ProjectRequest request) {
        return ApiResponse.success(candidateService.updateProject(userId, projectId, request), "Cập nhật dự án thành công");
    }

    @DeleteMapping("/{userId}/projects/{projectId}")
    @Operation(summary = "Xóa dự án")
    public ApiResponse<Void> deleteProject(
            @PathVariable("userId") Long userId,
            @PathVariable("projectId") Long projectId) {
        candidateService.deleteProject(userId, projectId);
        return ApiResponse.success(null, "Xóa dự án thành công");
    }

    // ==========================================
    // 8. QUẢN LÝ CHỨNG CHỈ (CERTIFICATIONS)
    // ==========================================
    @GetMapping("/{userId}/certifications")
    @Operation(summary = "Lấy danh sách chứng chỉ")
    public ApiResponse<List<CertificationResponse>> getCertifications(@PathVariable("userId") Long userId) {
        return ApiResponse.success(candidateService.getCertificationsByUserId(userId));
    }

    @PostMapping("/{userId}/certifications")
    @Operation(summary = "Thêm chứng chỉ mới")
    public ApiResponse<CertificationResponse> createCertification(
            @PathVariable("userId") Long userId,
            @Valid @RequestBody CertificationRequest request) {
        return ApiResponse.success(candidateService.createCertification(userId, request), "Thêm chứng chỉ thành công");
    }

    @PutMapping("/{userId}/certifications/{certificationId}")
    @Operation(summary = "Cập nhật chứng chỉ")
    public ApiResponse<CertificationResponse> updateCertification(
            @PathVariable("userId") Long userId,
            @PathVariable("certificationId") Long certificationId,
            @Valid @RequestBody CertificationRequest request) {
        return ApiResponse.success(candidateService.updateCertification(userId, certificationId, request), "Cập nhật chứng chỉ thành công");
    }

    @DeleteMapping("/{userId}/certifications/{certificationId}")
    @Operation(summary = "Xóa chứng chỉ")
    public ApiResponse<Void> deleteCertification(
            @PathVariable("userId") Long userId,
            @PathVariable("certificationId") Long certificationId) {
        candidateService.deleteCertification(userId, certificationId);
        return ApiResponse.success(null, "Xóa chứng chỉ thành công");
    }

    // ==========================================
    // 9. QUẢN LÝ HOẠT ĐỘNG (ACTIVITIES)
    // ==========================================
    @GetMapping("/{userId}/activities")
    @Operation(summary = "Lấy danh sách hoạt động")
    public ApiResponse<List<ActivityResponse>> getActivities(@PathVariable("userId") Long userId) {
        return ApiResponse.success(candidateService.getActivitiesByUserId(userId));
    }

    @PostMapping("/{userId}/activities")
    @Operation(summary = "Thêm hoạt động mới")
    public ApiResponse<ActivityResponse> createActivity(
            @PathVariable("userId") Long userId,
            @Valid @RequestBody ActivityRequest request) {
        return ApiResponse.success(candidateService.createActivity(userId, request), "Thêm hoạt động thành công");
    }

    @PutMapping("/{userId}/activities/{activityId}")
    @Operation(summary = "Cập nhật hoạt động")
    public ApiResponse<ActivityResponse> updateActivity(
            @PathVariable("userId") Long userId,
            @PathVariable("activityId") Long activityId,
            @Valid @RequestBody ActivityRequest request) {
        return ApiResponse.success(candidateService.updateActivity(userId, activityId, request), "Cập nhật hoạt động thành công");
    }

    @DeleteMapping("/{userId}/activities/{activityId}")
    @Operation(summary = "Xóa hoạt động")
    public ApiResponse<Void> deleteActivity(
            @PathVariable("userId") Long userId,
            @PathVariable("activityId") Long activityId) {
        candidateService.deleteActivity(userId, activityId);
        return ApiResponse.success(null, "Xóa hoạt động thành công");
    }

    // ==========================================
    // 10. QUẢN LÝ GIẢI THƯỞNG (AWARDS)
    // ==========================================
    @GetMapping("/{userId}/awards")
    @Operation(summary = "Lấy danh sách giải thưởng")
    public ApiResponse<List<AwardResponse>> getAwards(@PathVariable("userId") Long userId) {
        return ApiResponse.success(candidateService.getAwardsByUserId(userId));
    }

    @PostMapping("/{userId}/awards")
    @Operation(summary = "Thêm giải thưởng mới")
    public ApiResponse<AwardResponse> createAward(
            @PathVariable("userId") Long userId,
            @Valid @RequestBody AwardRequest request) {
        return ApiResponse.success(candidateService.createAward(userId, request), "Thêm giải thưởng thành công");
    }

    @PutMapping("/{userId}/awards/{awardId}")
    @Operation(summary = "Cập nhật giải thưởng")
    public ApiResponse<AwardResponse> updateAward(
            @PathVariable("userId") Long userId,
            @PathVariable("awardId") Long awardId,
            @Valid @RequestBody AwardRequest request) {
        return ApiResponse.success(candidateService.updateAward(userId, awardId, request), "Cập nhật giải thưởng thành công");
    }

    @DeleteMapping("/{userId}/awards/{awardId}")
    @Operation(summary = "Xóa giải thưởng")
    public ApiResponse<Void> deleteAward(
            @PathVariable("userId") Long userId,
            @PathVariable("awardId") Long awardId) {
        candidateService.deleteAward(userId, awardId);
        return ApiResponse.success(null, "Xóa giải thưởng thành công");
    }

    // ==========================================
    // 11. QUẢN LÝ SỞ THÍCH (HOBBIES)
    // ==========================================
    @GetMapping("/{userId}/hobbies")
    @Operation(summary = "Lấy danh sách sở thích")
    public ApiResponse<List<HobbyResponse>> getHobbies(@PathVariable("userId") Long userId) {
        return ApiResponse.success(candidateService.getHobbiesByUserId(userId));
    }

    @PostMapping("/{userId}/hobbies")
    @Operation(summary = "Thêm sở thích mới")
    public ApiResponse<HobbyResponse> createHobby(
            @PathVariable("userId") Long userId,
            @Valid @RequestBody HobbyRequest request) {
        return ApiResponse.success(candidateService.createHobby(userId, request), "Thêm sở thích thành công");
    }

    @PutMapping("/{userId}/hobbies/{hobbyId}")
    @Operation(summary = "Cập nhật sở thích")
    public ApiResponse<HobbyResponse> updateHobby(
            @PathVariable("userId") Long userId,
            @PathVariable("hobbyId") Long hobbyId,
            @Valid @RequestBody HobbyRequest request) {
        return ApiResponse.success(candidateService.updateHobby(userId, hobbyId, request), "Cập nhật sở thích thành công");
    }

    @DeleteMapping("/{userId}/hobbies/{hobbyId}")
    @Operation(summary = "Xóa sở thích")
    public ApiResponse<Void> deleteHobby(
            @PathVariable("userId") Long userId,
            @PathVariable("hobbyId") Long hobbyId) {
        candidateService.deleteHobby(userId, hobbyId);
        return ApiResponse.success(null, "Xóa sở thích thành công");
    }

    // ==========================================
    // 12. QUẢN LÝ NGOẠI NGỮ (LANGUAGES)
    // ==========================================
    @GetMapping("/{userId}/languages")
    @Operation(summary = "Lấy danh sách ngoại ngữ")
    public ApiResponse<List<LanguageResponse>> getLanguages(@PathVariable("userId") Long userId) {
        return ApiResponse.success(candidateService.getLanguagesByUserId(userId));
    }

    @PostMapping("/{userId}/languages")
    @Operation(summary = "Thêm ngoại ngữ mới")
    public ApiResponse<LanguageResponse> createLanguage(
            @PathVariable("userId") Long userId,
            @Valid @RequestBody LanguageRequest request) {
        return ApiResponse.success(candidateService.createLanguage(userId, request), "Thêm ngoại ngữ thành công");
    }

    @PutMapping("/{userId}/languages/{languageId}")
    @Operation(summary = "Cập nhật ngoại ngữ")
    public ApiResponse<LanguageResponse> updateLanguage(
            @PathVariable("userId") Long userId,
            @PathVariable("languageId") Long languageId,
            @Valid @RequestBody LanguageRequest request) {
        return ApiResponse.success(candidateService.updateLanguage(userId, languageId, request), "Cập nhật ngoại ngữ thành công");
    }

    @DeleteMapping("/{userId}/languages/{languageId}")
    @Operation(summary = "Xóa ngoại ngữ")
    public ApiResponse<Void> deleteLanguage(
            @PathVariable("userId") Long userId,
            @PathVariable("languageId") Long languageId) {
        candidateService.deleteLanguage(userId, languageId);
        return ApiResponse.success(null, "Xóa ngoại ngữ thành công");
    }

    @PostMapping("/{userId}/skills/{skillId}/assign")
    @Operation(summary = "Gán nhanh 1 kỹ năng đã tồn tại (theo skillId) vào hồ sơ, không cần nhập tên")
    public ApiResponse<Void> assignSkill(
            @PathVariable("userId") Long userId,
            @PathVariable("skillId") Long skillId) {
        candidateService.addSkillToCandidate(userId, skillId);
        return ApiResponse.success(null, "Đã gán kỹ năng vào hồ sơ");
    }

    @DeleteMapping("/{userId}/skills/{skillId}")
    @Operation(summary = "Gỡ 1 kỹ năng khỏi hồ sơ ứng viên")
    public ApiResponse<Void> removeSkill(
            @PathVariable("userId") Long userId,
            @PathVariable("skillId") Long skillId) {
        candidateService.removeSkillFromCandidate(userId, skillId);
        return ApiResponse.success(null, "Đã gỡ kỹ năng khỏi hồ sơ");
    }

    // ==========================================
    // PROFILE LAYOUT (SANDBOX KÉO-THẢ) — [MỚI]
    // ==========================================
    @GetMapping("/{userId}/profile/layout")
    @Operation(summary = "Lấy cấu hình layout ProfilePage (tự khởi tạo mặc định nếu chưa có)")
    public ApiResponse<List<ProfileLayoutItemResponse>> getProfileLayout(
            @PathVariable("userId") Long userId) {
        return ApiResponse.success(candidateService.getProfileLayout(userId));
    }

    @PutMapping("/{userId}/profile/layout/reorder")
    @Operation(summary = "Kéo-thả đổi vị trí nhiều block cùng lúc")
    public ApiResponse<List<ProfileLayoutItemResponse>> reorderProfileLayout(
            @PathVariable("userId") Long userId,
            @Valid @RequestBody ProfileLayoutReorderRequest request) {
        return ApiResponse.success(candidateService.reorderProfileLayout(userId, request), "Cập nhật bố cục thành công");
    }

    @PatchMapping("/{userId}/profile/layout/{blockType}/visibility")
    @Operation(summary = "Ẩn/hiện 1 block trên ProfilePage")
    public ApiResponse<ProfileLayoutItemResponse> toggleBlockVisibility(
            @PathVariable("userId") Long userId,
            @PathVariable("blockType") String blockType,
            @RequestBody ToggleBlockVisibilityRequest request) {
        return ApiResponse.success(
                candidateService.toggleBlockVisibility(userId, blockType, request.isVisible()),
                "Cập nhật hiển thị block thành công"
        );
    }

    @GetMapping("/reference-values/search")
    @Operation(summary = "Tìm kiếm giá trị danh mục dùng chung (SKILL/LANGUAGE/...) cho dropdown")
    public ApiResponse<List<ReferenceValueResponse>> searchReferenceValues(
            @RequestParam("type") String type,
            @RequestParam(value = "keyword", required = false, defaultValue = "") String keyword) {
        return ApiResponse.success(candidateService.searchReferenceValues(type, keyword));
    }

    @PostMapping("/{userId}/reference-values/suggestions")
    @Operation(summary = "Gửi đề xuất thêm mới / sửa / xóa 1 giá trị danh mục cho admin duyệt")
    public ApiResponse<SuggestionResponse> suggestReferenceValue(
            @PathVariable("userId") Long userId,
            @Valid @RequestBody SuggestionRequest request) {
        return ApiResponse.success(candidateService.suggestReferenceValue(userId, request), "Đã gửi đề xuất, chờ admin duyệt");
    }

    @PutMapping("/{userId}/skills/reorder")
    @Operation(summary = "Kéo-thả sắp xếp lại thứ tự hiển thị các skill")
    public ApiResponse<List<CandidateSkillResponse>> reorderSkills(
            @PathVariable("userId") Long userId,
            @Valid @RequestBody SkillReorderRequest request) {
        return ApiResponse.success(candidateService.reorderSkills(userId, request), "Cập nhật thứ tự kỹ năng thành công");
    }

    @GetMapping("/{userId}/profile/full")
    @Operation(summary = "Lấy toàn bộ dữ liệu ProfilePage (layout + 9 block danh sách) trong 1 lần gọi — phục vụ sandbox kéo-thả")
    public ApiResponse<CandidateProfileFullResponse> getFullProfile(
            @PathVariable("userId") Long userId) {
        return ApiResponse.success(candidateService.getFullProfile(userId));
    }

    @PostMapping(value = "/{userId}/cvs/extract", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Trích xuất dữ liệu từ ảnh/PDF/docx CV (OCR + NER) để prefill CV Builder — KHÔNG lưu vào DB")
    public ApiResponse<ParsedCvResponse> extractCv(
            @PathVariable("userId") Long userId,
            @RequestParam("file") MultipartFile file) {
        return ApiResponse.success(candidateService.extractCvFromFile(userId, file), "Trích xuất CV thành công");
    }
}