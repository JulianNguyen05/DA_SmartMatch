package com.worklify.application.candidate.service;
import com.worklify.application.candidate.dto.*;
import com.worklify.application.common.dto.PageResponse;
import com.worklify.domain.common.DomainPageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface CandidateService {
    CandidateProfileResponse createProfile(Long userId, CandidateProfileRequest request);
    CandidateProfileResponse updateProfile(Long userId, CandidateProfileRequest request);
    CandidateProfileResponse getProfileByUserId(Long userId);

    CvDocumentResponse uploadCv(Long userId, MultipartFile file);
    CvDocumentResponse saveGeneratedCv(Long userId, String rawText);
    CvDocumentResponse getLatestGeneratedCv(Long userId);
    List<CvDocumentResponse> getCvsByUserId(Long userId);
    void deleteCv(Long userId, Long cvId);

    List<CandidateSkillResponse> getSkillsByUserId(Long userId);
    CandidateSkillResponse createSkill(Long userId, CandidateSkillRequest request);
    CandidateSkillResponse updateSkill(Long userId, Long skillId, CandidateSkillRequest request);

    void addSkillToCandidate(Long userId, Long skillId);
    void removeSkillFromCandidate(Long userId, Long skillId);

    CvDocumentResponse renameCv(Long userId, Long cvId, String newName);
    PageResponse<CandidateProfileResponse> searchCandidates(String keyword, DomainPageable pageable);
    CvDocumentResponse getCvDetail(Long userId, Long cvId);
}