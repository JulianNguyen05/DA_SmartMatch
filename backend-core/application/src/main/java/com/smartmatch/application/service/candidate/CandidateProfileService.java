package com.smartmatch.application.service.candidate;

import com.smartmatch.application.dto.candidate.CandidateProfileRequest;
import com.smartmatch.application.dto.candidate.CandidateProfileResponse;

public interface CandidateProfileService {
    CandidateProfileResponse saveOrUpdate(CandidateProfileRequest request, Long candidateId);
    CandidateProfileResponse getMyProfile(Long candidateId);
}