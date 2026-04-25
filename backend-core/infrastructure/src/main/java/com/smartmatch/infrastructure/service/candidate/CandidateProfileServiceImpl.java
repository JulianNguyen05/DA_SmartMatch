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
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CandidateProfileServiceImpl implements CandidateProfileService {

    private final CandidateProfileRepository profileRepository;
    private final CandidateProfileMapper appMapper;

    @Override
    public CandidateProfileResponse saveOrUpdate(CandidateProfileRequest request, Long candidateId) {
        CandidateProfile profile;

        if (request.getId() != null) {
            profile = profileRepository.findById(request.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hồ sơ!"));

            if (!profile.getCandidateId().equals(candidateId)) {
                throw new IllegalArgumentException("Bạn không có quyền chỉnh sửa hồ sơ này!");
            }
        } else {
            profile = CandidateProfile.builder()
                    .candidateId(candidateId)
                    .createdAt(LocalDateTime.now())
                    .build();
        }

        profile.setProfileName(request.getProfileName());
        profile.setFullName(request.getFullName());
        profile.setHeadline(request.getHeadline());
        profile.setSections(request.getSections());
        profile.setUpdatedAt(LocalDateTime.now());

        CandidateProfile saved = profileRepository.save(profile);
        return appMapper.toResponse(saved);
    }

    @Override
    public List<CandidateProfileResponse> getMyProfiles(Long candidateId) {
        return profileRepository.findAllByCandidateId(candidateId).stream()
                .map(appMapper::toResponse)
                .collect(Collectors.toList());
    }
}