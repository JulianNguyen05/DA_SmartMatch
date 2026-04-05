package com.smartmatch.domain.user.repository;

import com.smartmatch.domain.user.model.CandidateProfile;

import java.util.Optional;

public interface CandidateProfileRepository {
    CandidateProfile save(CandidateProfile profile);
    Optional<CandidateProfile> findByCandidateId(Long candidateId);
}