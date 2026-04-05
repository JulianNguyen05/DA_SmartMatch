package com.smartmatch.infrastructure.service.candidate;

import com.smartmatch.application.dto.candidate.CandidateProfileRequest;
import com.smartmatch.application.dto.candidate.CandidateProfileResponse;
import com.smartmatch.application.mapper.CandidateProfileMapper;
import com.smartmatch.application.service.candidate.CandidateProfileService;
import com.smartmatch.domain.user.model.CandidateProfile;
import com.smartmatch.domain.user.repository.CandidateProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CandidateProfileServiceImpl implements CandidateProfileService {

    private final CandidateProfileRepository profileRepository;
    private final com.smartmatch.application.mapper.CandidateProfileMapper appMapper; // app layer mapper

    @Override
    public CandidateProfileResponse saveOrUpdate(CandidateProfileRequest request, Long candidateId) {
        CandidateProfile profile = profileRepository.findByCandidateId(candidateId)
                .orElse(CandidateProfile.builder().candidateId(candidateId).build());

        profile.setFullName(request.getFullName());
        profile.setHeadline(request.getHeadline());
        profile.setSummary(request.getSummary());
        profile.setSkills(request.getSkills());
        profile.setEducation(request.getEducation());
        profile.setExperience(request.getExperience());
        profile.setUpdatedAt(LocalDateTime.now());

        CandidateProfile saved = profileRepository.save(profile);
        return appMapper.toResponse(saved); // bạn cần tạo app mapper
    }

    @Override
    public CandidateProfileResponse getMyProfile(Long candidateId) {
        CandidateProfile profile = profileRepository.findByCandidateId(candidateId)
                .orElseThrow(() -> new IllegalArgumentException("Chưa có profile. Vui lòng tạo trước!"));
        return appMapper.toResponse(profile);
    }
}