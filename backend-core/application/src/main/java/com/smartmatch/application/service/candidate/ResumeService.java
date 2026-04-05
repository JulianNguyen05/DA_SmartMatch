package com.smartmatch.application.service.candidate;

import com.smartmatch.application.dto.candidate.ResumeResponse;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface ResumeService {
    ResumeResponse uploadResume(MultipartFile file, Long candidateId);
    List<ResumeResponse> getMyResumes(Long candidateId);
}