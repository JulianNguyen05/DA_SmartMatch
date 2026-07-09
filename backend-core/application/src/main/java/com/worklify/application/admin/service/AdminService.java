package com.worklify.application.admin.service;

import com.worklify.application.admin.dto.AdminJobResponse;
import com.worklify.application.admin.dto.DashboardStatsResponse;
import com.worklify.application.admin.dto.SystemLogResponse;
import com.worklify.application.auth.dto.UserResponse;
import com.worklify.application.common.dto.PageResponse;
import com.worklify.application.employer.dto.CompanyProfileResponse;
import com.worklify.application.referencedata.dto.SuggestionResponse;
import com.worklify.domain.common.DomainPageable;
import com.worklify.domain.referencedata.model.SuggestionStatus;

import java.util.List;

public interface AdminService {
    DashboardStatsResponse getDashboardStats();

    void moderateJob(Long jobId, boolean approve, String reason);
    List<AdminJobResponse> getPendingJobs();

    List<SuggestionResponse> getSuggestions(SuggestionStatus status);
    SuggestionResponse approveSuggestion(Long suggestionId);
    SuggestionResponse rejectSuggestion(Long suggestionId, String reviewNote);

    PageResponse<SystemLogResponse> getSystemLogs(DomainPageable pageable);
    PageResponse<UserResponse> getAllUsers(DomainPageable pageable);

    void banUser(Long userId);
    void unbanUser(Long userId);

    List<CompanyProfileResponse> getPendingCompanies();
    void moderateCompany(Long companyId, boolean approve, String reason);
}