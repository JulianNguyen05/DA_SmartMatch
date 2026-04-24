package com.smartmatch.application.service.candidate;

import com.smartmatch.application.dto.candidate.CandidateProfileRequest;
import com.smartmatch.application.dto.candidate.CandidateProfileResponse;

import java.util.List;

public interface CandidateProfileService {
    CandidateProfileResponse saveOrUpdate(CandidateProfileRequest request, Long candidateId);
    List<CandidateProfileResponse> getMyProfiles(Long candidateId);
}