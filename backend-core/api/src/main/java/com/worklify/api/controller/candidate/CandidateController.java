package com.worklify.api.controller.candidate;

import com.worklify.api.common.response.ApiResponse;
import com.worklify.application.candidate.dto.*;
import com.worklify.application.candidate.service.CandidateService;
import com.worklify.application.common.dto.PageResponse;
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
    @Operation(summary = "Tải lên CV (PDF/Word)")
    public ApiResponse<CvDocumentResponse> uploadCv(
            @PathVariable("userId") Long userId,
            @RequestParam("file") MultipartFile file) throws IOException {

        // Truyền thẳng file nhận được xuống tầng service xử lý vật lý
        return ApiResponse.success(candidateService.uploadCv(userId, file), "Tải CV lên thành công");
    }

    @GetMapping("/{userId}/cvs")
    @Operation(summary = "Lấy danh sách CV PDF/Word đã lưu của ứng viên")
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
}