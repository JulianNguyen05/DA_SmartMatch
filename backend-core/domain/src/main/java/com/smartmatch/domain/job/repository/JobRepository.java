package com.smartmatch.domain.job.repository;

import com.smartmatch.domain.job.model.Job;

import java.util.List;
import java.util.Optional;

public interface JobRepository {
    Job save(Job job);
    Optional<Job> findById(Long id);
    List<Job> findByCompanyId(Long companyId);     // giữ lại cho sau
    List<Job> findByPostedById(Long postedById);   // ← MỚI: GetMyJobs
    List<Job> findAllPublished();                  // giữ lại cho public
    Optional<Job> findByIdAndPostedById(Long id, Long postedById); // ← MỚI: bảo vệ Job của employer
}