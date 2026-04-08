package com.smartmatch.infrastructure.service.candidate;

import com.smartmatch.application.dto.application.ApplyJobRequest;
import com.smartmatch.application.dto.application.JobApplicationResponse;
import com.smartmatch.application.mapper.JobApplicationMapper;
import com.smartmatch.application.service.candidate.ApplicationService;
import com.smartmatch.domain.application.model.JobApplication;
import com.smartmatch.domain.application.repository.JobApplicationRepository;
import com.smartmatch.domain.common.enums.ApplicationStatus;
import com.smartmatch.domain.common.enums.JobStatus;
import com.smartmatch.domain.job.model.Job;
import com.smartmatch.domain.job.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ApplicationServiceImpl implements ApplicationService {

    private final JobApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final JobApplicationMapper applicationMapper;

    @Override
    public JobApplicationResponse applyJob(ApplyJobRequest request, Long candidateId) {
        Long jobId = request.getJobId();

        // 1. Kiểm tra Job tồn tại và đang mở
        Optional<Job> jobOpt = jobRepository.findById(jobId);
        if (jobOpt.isEmpty()) {
            throw new IllegalArgumentException("Tin tuyển dụng không tồn tại!");
        }
        if (jobOpt.get().getStatus() != JobStatus.PUBLISHED) {
            throw new IllegalArgumentException("Tin tuyển dụng này đã đóng hoặc chưa được công bố!");
        }

        // 2. Kiểm tra candidate đã nộp đơn chưa (chống nộp trùng)
        if (applicationRepository.existsByJobIdAndCandidateId(jobId, candidateId)) {
            throw new IllegalArgumentException("Bạn đã nộp đơn ứng tuyển cho vị trí này rồi!");
        }

        // 3. Convert DTO → Domain
        JobApplication application = applicationMapper.toDomain(request, candidateId);

        // 4. Lưu vào DB
        JobApplication savedApplication = applicationRepository.save(application);

        // 5. Trả về response
        return applicationMapper.toResponse(savedApplication);
    }

    @Override
    public List<JobApplicationResponse> getMyApplications(Long candidateId) {
        List<JobApplication> applications = applicationRepository.findByCandidateId(candidateId);
        return applications.stream()
                .map(applicationMapper::toResponse)
                .toList();
    }

    @Override
    public List<JobApplicationResponse> getApplicationsByJobId(Long jobId, Long employerId) {
        // Kiểm tra employer có quyền xem job này không
        jobRepository.findByIdAndPostedById(jobId, employerId)
                .orElseThrow(() -> new IllegalArgumentException("Bạn không có quyền xem đơn ứng tuyển của tin này!"));

        List<JobApplication> applications = applicationRepository.findByJobId(jobId);
        return applications.stream()
                .map(applicationMapper::toResponse)
                .toList();
    }
    @Override
    public void withdrawApplication(Long applicationId, Long candidateId) {
        JobApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn ứng tuyển!"));

        if (!application.getCandidateId().equals(candidateId)) {
            throw new IllegalArgumentException("Bạn không có quyền rút đơn này!");
        }

        if (application.getStatus() != ApplicationStatus.PENDING) {
            throw new IllegalArgumentException("Chỉ có thể rút đơn khi đang ở trạng thái Chờ xử lý (PENDING)!");
        }

        // Cần thêm hàm delete vào JobApplicationRepository
        applicationRepository.delete(application);
    }
}