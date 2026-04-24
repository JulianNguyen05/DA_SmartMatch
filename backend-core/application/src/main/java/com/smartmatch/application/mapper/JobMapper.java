package com.smartmatch.application.mapper;

import com.smartmatch.application.dto.job.CreateJobRequest;
import com.smartmatch.application.dto.job.JobResponse;
import com.smartmatch.domain.common.enums.JobStatus;
import com.smartmatch.domain.job.model.Job;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component("appJobMapper")
public class JobMapper {

    public Job toDomain(CreateJobRequest request, Long companyId, Long postedById) {
        if (request == null) return null;
        return Job.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .companyId(companyId)
                .location(request.getLocation())
                .minSalary(request.getMinSalary())
                .maxSalary(request.getMaxSalary())
                .currency(request.getCurrency() != null ? request.getCurrency() : "VND")
                .jobType(request.getJobType())
                .experienceLevel(request.getExperienceLevel())
                .minExperienceYears(request.getMinExperienceYears())
                .requirements(request.getRequirements())
                .benefits(request.getBenefits())
                .deadline(request.getDeadline())
                .status(JobStatus.PUBLISHED)
                .postedAt(LocalDateTime.now())
                .postedById(postedById)
                .customFormTemplate(request.getCustomFormTemplate())
                .build();
    }

    public JobResponse toResponse(Job job) {
        if (job == null) return null;
        return JobResponse.builder()
                .id(job.getId())
                .title(job.getTitle())
                .description(job.getDescription())
                .companyId(job.getCompanyId())
                .location(job.getLocation())
                .minSalary(job.getMinSalary())
                .maxSalary(job.getMaxSalary())
                .currency(job.getCurrency())
                .jobType(job.getJobType())
                .experienceLevel(job.getExperienceLevel())
                .minExperienceYears(job.getMinExperienceYears())
                .requirements(job.getRequirements())
                .benefits(job.getBenefits())
                .postedAt(job.getPostedAt())
                .deadline(job.getDeadline())
                .status(job.getStatus())
                .customFormTemplate(job.getCustomFormTemplate())
                .build();
    }

    public List<JobResponse> toResponseList(List<Job> jobs) {
        return jobs.stream().map(this::toResponse).toList();
    }
}