package com.smartmatch.infrastructure.service.employer;

import com.smartmatch.application.dto.job.CreateJobRequest;
import com.smartmatch.application.dto.job.JobResponse;
import com.smartmatch.application.mapper.JobMapper;
import com.smartmatch.application.service.employer.JobService;
import com.smartmatch.domain.company.model.Company;
import com.smartmatch.domain.company.repository.CompanyRepository;
import com.smartmatch.domain.job.model.Job;
import com.smartmatch.domain.job.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class JobServiceImpl implements JobService {

    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;
    private final JobMapper jobMapper;

    @Override
    public JobResponse createJob(CreateJobRequest request, Long employerId) {
        // 1. Lấy company của employer hiện tại
        Optional<Company> companyOpt = companyRepository.findByOwnerId(employerId);
        if (companyOpt.isEmpty()) {
            throw new IllegalArgumentException("Bạn chưa tạo thông tin công ty. Vui lòng tạo Company trước khi đăng tin tuyển dụng!");
        }

        Long companyId = companyOpt.get().getId();

        // 2. Convert DTO → Domain (tự động gán companyId + postedById)
        Job job = jobMapper.toDomain(request, companyId, employerId);

        // 3. Lưu vào DB
        Job savedJob = jobRepository.save(job);

        // 4. Trả về response
        return jobMapper.toResponse(savedJob);
    }

    @Override
    public List<JobResponse> getMyJobs(Long employerId) {
        List<Job> jobs = jobRepository.findByPostedById(employerId);
        return jobMapper.toResponseList(jobs);
    }

    @Override
    public JobResponse getJobById(Long jobId, Long employerId) {
        Optional<Job> jobOpt = jobRepository.findByIdAndPostedById(jobId, employerId);
        if (jobOpt.isEmpty()) {
            throw new IllegalArgumentException("Không tìm thấy tin tuyển dụng hoặc bạn không có quyền xem!");
        }
        return jobMapper.toResponse(jobOpt.get());
    }
}