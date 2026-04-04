package com.smartmatch.domain.application.repository;

import com.smartmatch.domain.application.model.JobApplication;

import java.util.List;
import java.util.Optional;

public interface JobApplicationRepository {
    JobApplication save(JobApplication application);
    Optional<JobApplication> findById(Long id);
    boolean existsByJobIdAndCandidateId(Long jobId, Long candidateId); // chống nộp trùng
    List<JobApplication> findByJobId(Long jobId);                     // employer xem ai nộp
    List<JobApplication> findByCandidateId(Long candidateId);         // candidate xem đơn của mình
}