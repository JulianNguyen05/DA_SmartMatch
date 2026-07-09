package com.worklify.api.controller.admin;

import com.worklify.api.common.response.ApiResponse;
import com.worklify.application.admin.dto.*;
import com.worklify.application.admin.service.AdminService;
import com.worklify.application.auth.dto.UserResponse;
import com.worklify.application.common.dto.PageResponse;
import com.worklify.application.employer.dto.CompanyProfileResponse;
import com.worklify.application.referencedata.dto.SuggestionResponse;
import com.worklify.domain.common.DomainPageable;
import com.worklify.domain.referencedata.model.SuggestionStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List; // Thêm dòng này để sửa lỗi List

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Tag(name = "6. Admin Dashboard", description = "Quản trị hệ thống, Kiểm duyệt và Báo cáo")
@PreAuthorize("hasRole('ADMIN')") // Cực kỳ quan trọng: Khóa toàn bộ class này bằng role ADMIN
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/dashboard")
    @Operation(summary = "Lấy các chỉ số thống kê tổng quan (Dashboard)")
    public ApiResponse<DashboardStatsResponse> getStats() {
        return ApiResponse.success(adminService.getDashboardStats());
    }

// Đừng quên import DTO mới: import com.smartmatch.application.admin.dto.JobModerationRequest;

    @PatchMapping("/jobs/{jobId}/moderate")
    @Operation(summary = "Kiểm duyệt (Duyệt/Khóa) tin tuyển dụng")
    public ApiResponse<Void> moderateJob(
            @PathVariable("jobId") Long jobId,
            @RequestBody JobModerationRequest request) { // <-- Đổi sang RequestBody

        boolean isApprove = "APPROVED".equalsIgnoreCase(request.getAction());
        adminService.moderateJob(jobId, isApprove, request.getReason());

        return ApiResponse.success(null, "Đã xử lý tin tuyển dụng");
    }

    @PatchMapping("/users/{userId}/ban")
    @Operation(summary = "Khóa tài khoản người dùng vi phạm")
    public ApiResponse<Void> banUser(
            @PathVariable("userId") Long userId) { // <--- THÊM ("userId") VÀO ĐÂY
        adminService.banUser(userId);
        return ApiResponse.success(null, "Đã khóa tài khoản người dùng");
    }

    @GetMapping("/companies/pending")
    @Operation(summary = "Lấy danh sách doanh nghiệp đang chờ duyệt")
    public ApiResponse<List<CompanyProfileResponse>> getPendingCompanies() {
        return ApiResponse.success(adminService.getPendingCompanies());
    }

    @PatchMapping("/companies/{companyId}/moderate")
    @Operation(summary = "Duyệt hoặc từ chối hồ sơ doanh nghiệp")
    public ApiResponse<Void> moderateCompany(
            @PathVariable("companyId") Long companyId, // <--- THÊM ("companyId") VÀO ĐÂY
            @RequestBody CompanyModerationRequest request) {

        boolean isApprove = "APPROVED".equalsIgnoreCase(request.getAction());
        adminService.moderateCompany(companyId, isApprove, request.getReason());

        return ApiResponse.success(null, "Đã xử lý hồ sơ doanh nghiệp");
    }

    @GetMapping("/jobs/pending")
    @Operation(summary = "Lấy danh sách tin tuyển dụng đang chờ duyệt")
    public ApiResponse<List<AdminJobResponse>> getPendingJobs() {
        return ApiResponse.success(adminService.getPendingJobs());
    }

    @GetMapping("/users")
    @Operation(summary = "Lấy danh sách tất cả người dùng (Có phân trang)")
    public ApiResponse<PageResponse<UserResponse>> getAllUsers(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {

        DomainPageable pageable = new DomainPageable() {
            @Override
            public int getPageNumber() { return page; }
            @Override
            public int getPageSize() { return size; }
            @Override
            public org.springframework.data.domain.Pageable toSpringPageable() {
                return org.springframework.data.domain.PageRequest.of(page, size);
            }
        };

        return ApiResponse.success(adminService.getAllUsers(pageable));
    }

    // ==========================================
    // DUYỆT ĐỀ XUẤT SKILL/LANGUAGE (ReferenceValueSuggestion)
    // ==========================================
    @GetMapping("/suggestions")
    @Operation(summary = "Lấy danh sách đề xuất Skill/Language theo trạng thái (mặc định PENDING)")
    public ApiResponse<List<SuggestionResponse>> getSuggestions(
            @RequestParam(value = "status", required = false) SuggestionStatus status) {
        return ApiResponse.success(adminService.getSuggestions(status));
    }

    @PatchMapping("/suggestions/{suggestionId}/approve")
    @Operation(summary = "Duyệt đề xuất — tạo ReferenceValue chính thức từ suggestion")
    public ApiResponse<SuggestionResponse> approveSuggestion(
            @PathVariable("suggestionId") Long suggestionId) {
        return ApiResponse.success(adminService.approveSuggestion(suggestionId), "Đã duyệt đề xuất");
    }

    @PatchMapping("/suggestions/{suggestionId}/reject")
    @Operation(summary = "Từ chối đề xuất, kèm lý do để candidate biết")
    public ApiResponse<SuggestionResponse> rejectSuggestion(
            @PathVariable("suggestionId") Long suggestionId,
            @RequestBody SuggestionModerationRequest request) {
        return ApiResponse.success(
                adminService.rejectSuggestion(suggestionId, request.getReviewNote()),
                "Đã từ chối đề xuất"
        );
    }
}