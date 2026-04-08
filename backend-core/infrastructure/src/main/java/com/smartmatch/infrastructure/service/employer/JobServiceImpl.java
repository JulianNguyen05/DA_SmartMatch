package com.smartmatch.infrastructure.service.employer;

import com.smartmatch.application.dto.PageResponse;
import com.smartmatch.application.dto.job.CreateJobRequest;
import com.smartmatch.application.dto.job.JobResponse;
import com.smartmatch.application.dto.job.JobSearchRequest;
import com.smartmatch.application.mapper.JobMapper;
import com.smartmatch.application.service.employer.JobService;
import com.smartmatch.domain.company.model.Company;
import com.smartmatch.domain.company.repository.CompanyRepository;
import com.smartmatch.domain.job.model.Job;
import com.smartmatch.domain.job.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

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

    @Override
    public List<JobResponse> getAllPublishedJobs() {
        List<Job> jobs = jobRepository.findAllPublished();
        // Sắp xếp tin mới nhất trước
        return jobMapper.toResponseList(jobs);
    }

    @Override
    public JobResponse getPublicJobById(Long id) {
        Optional<Job> jobOpt = jobRepository.findById(id);
        if (jobOpt.isEmpty() || jobOpt.get().getStatus() != com.smartmatch.domain.common.enums.JobStatus.PUBLISHED) {
            throw new IllegalArgumentException("Tin tuyển dụng không tồn tại hoặc đã đóng!");
        }
        return jobMapper.toResponse(jobOpt.get());
    }
    @Override
    public List<JobResponse> searchPublishedJobs(JobSearchRequest request) {
        // Lấy tất cả tin đang PUBLISHED (đã có sẵn)
        List<Job> allPublished = jobRepository.findAllPublished();

        // Lọc theo các điều kiện (memory filter - phù hợp MVP, sau có thể nâng Specification)
        List<Job> filtered = allPublished.stream()
                .filter(job -> matchesKeyword(job, request.getKeyword()))
                .filter(job -> matchesLocation(job, request.getLocation()))
                .filter(job -> matchesJobType(job, request.getJobType()))
                .filter(job -> matchesExperienceLevel(job, request.getExperienceLevel()))
                .filter(job -> matchesSalary(job, request.getMinSalary(), request.getMaxSalary()))
                .sorted((a, b) -> b.getPostedAt().compareTo(a.getPostedAt())) // mới nhất trước
                .collect(Collectors.toList());

        // Phân trang đơn giản
        int page = Math.max(0, request.getPage());
        int size = Math.max(1, request.getSize());
        int from = page * size;
        int to = Math.min(from + size, filtered.size());

        if (from >= filtered.size()) {
            return List.of();
        }

        return jobMapper.toResponseList(filtered.subList(from, to));
    }

    private boolean matchesKeyword(Job job, String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) return true;
        String k = keyword.toLowerCase().trim();
        return job.getTitle().toLowerCase().contains(k) ||
                (job.getDescription() != null && job.getDescription().toLowerCase().contains(k));
    }

    private boolean matchesLocation(Job job, String location) {
        if (location == null || location.trim().isEmpty()) return true;
        return job.getLocation() != null && job.getLocation().equalsIgnoreCase(location.trim());
    }

    private boolean matchesJobType(Job job, com.smartmatch.domain.common.enums.JobType jobType) {
        if (jobType == null) return true;
        return job.getJobType() == jobType;
    }

    private boolean matchesExperienceLevel(Job job, com.smartmatch.domain.common.enums.ExperienceLevel level) {
        if (level == null) return true;
        return job.getExperienceLevel() == level;
    }

    private boolean matchesSalary(Job job, BigDecimal minSalary, BigDecimal maxSalary) {
        if (minSalary == null && maxSalary == null) return true;
        BigDecimal salary = job.getMaxSalary() != null ? job.getMaxSalary() : job.getMinSalary();
        if (salary == null) return true;

        if (minSalary != null && salary.compareTo(minSalary) < 0) return false;
        if (maxSalary != null && salary.compareTo(maxSalary) > 0) return false;
        return true;
    }

    @Override
    public PageResponse<JobResponse> searchPublishedJobs(JobSearchRequest request, Pageable pageable) {
        // Lấy tất cả tin PUBLISHED
        List<Job> allPublished = jobRepository.findAllPublished();

        // Áp dụng filter (giữ nguyên logic cũ)
        List<Job> filtered = allPublished.stream()
                .filter(job -> matchesKeyword(job, request.getKeyword()))
                .filter(job -> matchesLocation(job, request.getLocation()))
                .filter(job -> matchesJobType(job, request.getJobType()))
                .filter(job -> matchesExperienceLevel(job, request.getExperienceLevel()))
                .filter(job -> matchesSalary(job, request.getMinSalary(), request.getMaxSalary()))
                .collect(Collectors.toList());

        // Sort mặc định: mới nhất trước
        List<Job> sorted = filtered.stream()
                .sorted((a, b) -> b.getPostedAt().compareTo(a.getPostedAt()))
                .toList();

        // Tạo Pageable nếu chưa có (trường hợp gọi từ getAllPublishedJobs)
        Pageable effectivePageable = (pageable != null)
                ? pageable
                : PageRequest.of(request.getPage(), request.getSize(), Sort.by("postedAt").descending());

        // Tạo Page từ List đã lọc
        int start = (int) effectivePageable.getOffset();
        int end = Math.min(start + effectivePageable.getPageSize(), sorted.size());
        List<Job> pageContent = (start > sorted.size()) ? List.of() : sorted.subList(start, end);

        Page<Job> jobPage = new PageImpl<>(pageContent, effectivePageable, sorted.size());

        // Convert sang DTO và trả PageResponse
        Page<JobResponse> responsePage = jobPage.map(jobMapper::toResponse);
        return PageResponse.from(responsePage);
    }
}