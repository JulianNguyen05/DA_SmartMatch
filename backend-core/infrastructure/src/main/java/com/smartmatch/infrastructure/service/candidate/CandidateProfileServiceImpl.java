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
    private final CandidateProfileMapper appMapper; // app layer mapper

    @Override
    public CandidateProfileResponse saveOrUpdate(CandidateProfileRequest request, Long candidateId) {
        CandidateProfile profile;

        // Nếu request có truyền ID -> Chỉnh sửa Tab hiện tại
        if (request.getId() != null) {
            profile = profileRepository.findById(request.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hồ sơ!"));

            // Bảo mật: Tránh việc user này sửa hồ sơ của user khác
            if (!profile.getCandidateId().equals(candidateId)) {
                throw new IllegalArgumentException("Bạn không có quyền chỉnh sửa hồ sơ này!");
            }
        }
        // Nếu không có ID -> Tạo Tab hồ sơ mới
        else {
            profile = CandidateProfile.builder()
                    .candidateId(candidateId)
                    .createdAt(LocalDateTime.now())
                    .build();
        }

        // Cập nhật dữ liệu từ Form
        profile.setProfileName(request.getProfileName());
        profile.setFullName(request.getFullName());
        profile.setHeadline(request.getHeadline());
        profile.setSummary(request.getSummary());
        profile.setSkills(request.getSkills());
        profile.setEducation(request.getEducation());
        profile.setExperience(request.getExperience());
        profile.setUpdatedAt(LocalDateTime.now());

        CandidateProfile saved = profileRepository.save(profile);
        return appMapper.toResponse(saved);
    }

    // Lấy danh sách tất cả các Tab hồ sơ
    @Override
    public List<CandidateProfileResponse> getMyProfiles(Long candidateId) {
        return profileRepository.findAllByCandidateId(candidateId).stream()
                .map(appMapper::toResponse)
                .collect(Collectors.toList());
    }
}