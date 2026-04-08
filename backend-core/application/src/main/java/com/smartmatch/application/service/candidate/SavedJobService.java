package com.smartmatch.application.service.candidate;

import com.smartmatch.application.dto.job.SavedJobResponse;
import java.util.List;

public interface SavedJobService {
    void toggleSaveJob(Long jobId, Long candidateId);
    List<SavedJobResponse> getMySavedJobs(Long candidateId);
}