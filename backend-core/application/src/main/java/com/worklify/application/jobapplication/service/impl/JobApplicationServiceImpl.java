package com.worklify.application.jobapplication.service.impl;

import com.worklify.application.common.dto.PageResponse;
import com.worklify.application.jobapplication.dto.ApplicationRequest;
import com.worklify.application.jobapplication.dto.ApplicationResponse;
import com.worklify.application.jobapplication.service.JobApplicationService;
import com.worklify.domain.application.event.ApplicationSubmittedEvent;
import com.worklify.domain.application.model.Application;
import com.worklify.domain.application.model.ApplicationStatus;
import com.worklify.domain.application.repository.ApplicationRepository;
import com.worklify.domain.auth.model.User;
import com.worklify.domain.auth.repository.UserRepository;
import com.worklify.domain.candidate.model.CandidateProfile;
import com.worklify.domain.candidate.model.CvDocument;
import com.worklify.domain.candidate.repository.CandidateProfileRepository;
import com.worklify.domain.candidate.repository.CvDocumentRepository;
import com.worklify.domain.common.DomainPage;
import com.worklify.domain.common.DomainPageable;
import com.worklify.domain.employer.model.CompanyProfile;
import com.worklify.domain.employer.repository.CompanyProfileRepository;
import com.worklify.domain.job.model.JobPosting;
import com.worklify.domain.job.model.JobStatus;
import com.worklify.domain.job.repository.JobPostingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class JobApplicationServiceImpl implements JobApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobPostingRepository jobPostingRepository;
    private final CompanyProfileRepository companyProfileRepository;
    private final CvDocumentRepository cvDocumentRepository;
    private final UserRepository userRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final ApplicationEventPublisher eventPublisher; // [MỚI] để bắn ApplicationSubmittedEvent qua RabbitMQ

    @Override
    public ApplicationResponse applyJob(Long candidateId, ApplicationRequest request) {
        JobPosting jobPosting = jobPostingRepository.findById(request.getJobId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tin tuyển dụng tương ứng"));

        if (jobPosting.getStatus() != JobStatus.ACTIVE) {
            throw new IllegalArgumentException("Tin tuyển dụng hiện tại không còn hoạt động hoặc đã đóng");
        }

        Application application = Application.createNew(
                request.getJobId(),
                request.getCvId(),
                candidateId,
                request.getCoverLetter()
        );

        Application savedApplication = applicationRepository.save(application);

        // [MỚI] Bắn domain event -> DomainEventRabbitMqDispatcher sẽ bắt event này
        // và gửi sang queue "worklify.ai.submit.queue" cho backend-ml xử lý matching.
        eventPublisher.publishEvent(new ApplicationSubmittedEvent(
                savedApplication.getId(),
                candidateId,
                request.getJobId(),
                savedApplication.getAppliedAt()
        ));

        return mapToResponse(savedApplication);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ApplicationResponse> getApplicationsByCandidate(Long candidateId, DomainPageable pageable) {
        DomainPage<Application> page = applicationRepository.findByCandidateId(candidateId, pageable);
        return mapToPageResponse(page);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ApplicationResponse> getApplicationsForReviewBoard(Long jobId, DomainPageable pageable) {
        DomainPage<Application> page = applicationRepository.findByJobId(jobId, pageable);
        return mapToPageResponse(page);
    }

    @Override
    public void updateApplicationStatus(Long companyId, Long applicationId, ApplicationStatus status) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn ứng tuyển"));

        JobPosting jobPosting = jobPostingRepository.findById(application.getJobId())
                .orElseThrow(() -> new IllegalArgumentException("Tin tuyển dụng liên kết không tồn tại"));

        if (!jobPosting.getCompanyId().equals(companyId)) {
            throw new IllegalArgumentException("Bạn không có quyền thay đổi trạng thái đơn ứng tuyển của công việc này");
        }

        application.updateStatus(status);
        applicationRepository.save(application);
    }

    @Override
    @Transactional(readOnly = true)
    public ApplicationResponse getApplicationById(Long id) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn ứng tuyển"));
        return mapToResponse(application);
    }

    private ApplicationResponse mapToResponse(Application app) {
        JobPosting job = jobPostingRepository.findById(app.getJobId()).orElse(null);
        String jobTitle = (job != null) ? job.getTitle() : null;

        String companyName = null;
        String companyLogo = null;
        if (job != null) {
            CompanyProfile company = companyProfileRepository.findById(job.getCompanyId()).orElse(null);
            if (company != null) {
                companyName = company.getCompanyName();
                companyLogo = company.getLogoUrl();
            }
        }

        CvDocument cv = cvDocumentRepository.findById(app.getCvId()).orElse(null);
        String cvFileName = (cv != null) ? cv.getFileName() : null;

        String candidateName = null;
        String candidatePhone = null;
        String candidateEmail = null;

        if (app.getCandidateId() != null) {
            CandidateProfile candidate = candidateProfileRepository.findByUserId(app.getCandidateId()).orElse(null);
            if (candidate != null) {
                candidateName = candidate.getFullName();
                candidatePhone = candidate.getPhone();
            }

            User user = userRepository.findById(app.getCandidateId()).orElse(null);
            if (user != null && user.getEmail() != null) {
                candidateEmail = user.getEmail().value(); // ĐÃ SỬA CHỖ NÀY
            }
        }

        return ApplicationResponse.builder()
                .id(app.getId())
                .jobId(app.getJobId())
                .cvId(app.getCvId())
                .candidateId(app.getCandidateId())
                .coverLetter(app.getCoverLetter())
                .status(app.getStatus())
                .appliedAt(app.getAppliedAt())
                .blindTestUrl(null)
                .jobTitle(jobTitle)
                .companyName(companyName)
                .companyLogo(companyLogo)
                .cvFileName(cvFileName)
                .candidateName(candidateName)
                .candidateEmail(candidateEmail)
                .candidatePhone(candidatePhone)
                .build();
    }

    private PageResponse<ApplicationResponse> mapToPageResponse(DomainPage<Application> page) {
        return PageResponse.<ApplicationResponse>builder()
                .content(page.getContent().stream()
                        .map(this::mapToResponse)
                        .collect(Collectors.toList()))
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();
    }
}
