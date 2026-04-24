package com.smartmatch.domain.user.repository;

import com.smartmatch.domain.user.model.CandidateProfile;

import java.util.List;
import java.util.Optional;

public interface CandidateProfileRepository {

    // 1. Lưu hoặc cập nhật hồ sơ
    CandidateProfile save(CandidateProfile profile);

    // 2. Lấy danh sách tất cả các Tab hồ sơ của ứng viên
    List<CandidateProfile> findAllByCandidateId(Long candidateId);

    // 3. Lấy đích danh một hồ sơ cụ thể để chỉnh sửa
    Optional<CandidateProfile> findById(Long id);

}