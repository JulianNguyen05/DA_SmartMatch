package com.smartmatch.infrastructure.service.candidate;

import com.smartmatch.application.dto.job.JobResponse;
import com.smartmatch.application.dto.job.SavedJobResponse;
import com.smartmatch.application.mapper.JobMapper;
import com.smartmatch.application.service.candidate.SavedJobService;
import com.smartmatch.domain.common.enums.JobStatus;
import com.smartmatch.domain.job.model.Job;
import com.smartmatch.domain.job.model.SavedJob;
import com.smartmatch.domain.job.repository.JobRepository;
import com.smartmatch.domain.job.repository.SavedJobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SavedJobServiceImpl implements SavedJobService {

    private final SavedJobRepository savedJobRepository;
    private final JobRepository jobRepository;
    private final JobMapper jobMapper; // Sử dụng App JobMapper để convert Job sang JobResponse

    @Override
    public void toggleSaveJob(Long jobId, Long candidateId) {
        // Kiểm tra xem Job có tồn tại và đang mở không
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tin tuyển dụng!"));

        if (job.getStatus() != JobStatus.PUBLISHED) {
            throw new IllegalArgumentException("Không thể lưu tin tuyển dụng đã đóng hoặc hết hạn.");
        }

        Optional<SavedJob> existing = savedJobRepository.findByCandidateIdAndJobId(candidateId, jobId);

        if (existing.isPresent()) {
            // Đã lưu -> Bỏ lưu
            savedJobRepository.delete(existing.get());
        } else {
            // Chưa lưu -> Lưu mới
            SavedJob newSavedJob = SavedJob.builder()
                    .candidateId(candidateId)
                    .jobId(jobId)
                    .savedAt(LocalDateTime.now())
                    .build();
            savedJobRepository.save(newSavedJob);
        }
    }

    @Override
    public List<SavedJobResponse> getMySavedJobs(Long candidateId) {
        List<SavedJob> savedJobs = savedJobRepository.findByCandidateId(candidateId);

        return savedJobs.stream()
                .map(savedJob -> {
                    // Cố gắng lấy chi tiết công việc, nếu không có trả về null cho phần chi tiết
                    JobResponse jobDetails = jobRepository.findById(savedJob.getJobId())
                            .map(jobMapper::toResponse)
                            .orElse(null);

                    return SavedJobResponse.builder()
                            .id(savedJob.getId())
                            .jobId(savedJob.getJobId())
                            .jobDetails(jobDetails)
                            .savedAt(savedJob.getSavedAt())
                            .build();
                })
                .collect(Collectors.toList());
    }
}