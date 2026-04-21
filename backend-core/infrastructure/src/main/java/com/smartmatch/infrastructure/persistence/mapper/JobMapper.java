// backend-core/infrastructure/src/main/java/com/smartmatch/infrastructure/persistence/mapper/JobMapper.java
package com.smartmatch.infrastructure.persistence.mapper;

import com.smartmatch.domain.job.model.Job;
import com.smartmatch.infrastructure.persistence.jpa.JobJpaEntity;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.stream.Collectors;

@Component("jpaJobMapper")
public class JobMapper {

    public JobJpaEntity toEntity(Job job) {
        if (job == null) return null;
        return JobJpaEntity.builder()
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
                .postedById(job.getPostedById())
                .build();
    }

    public Job toDomain(JobJpaEntity entity) {
        if (entity == null) return null;
        return Job.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .companyId(entity.getCompanyId())
                .location(entity.getLocation())
                .minSalary(entity.getMinSalary())
                .maxSalary(entity.getMaxSalary())
                .currency(entity.getCurrency())
                .jobType(entity.getJobType())
                .experienceLevel(entity.getExperienceLevel())
                .minExperienceYears(entity.getMinExperienceYears())
                .requirements(entity.getRequirements() != null ? new ArrayList<>(entity.getRequirements()) : new ArrayList<>())
                .benefits(entity.getBenefits() != null ? new ArrayList<>(entity.getBenefits()) : new ArrayList<>())
                .postedAt(entity.getPostedAt())
                .deadline(entity.getDeadline())
                .status(entity.getStatus())
                .postedById(entity.getPostedById())
                .build();
    }
}