package com.smartmatch.domain.job.repository;

import com.smartmatch.domain.job.model.Job;

import java.util.List;
import java.util.Optional;

public interface JobRepository {
    Job save(Job job);
    Optional<Job> findById(Long id);
    List<Job> findByCompanyId(Long companyId);
    List<Job> findAllPublished();
}