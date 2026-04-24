package com.smartmatch.infrastructure.persistence.repository;

import com.smartmatch.domain.user.model.CandidateProfile;
import com.smartmatch.domain.user.repository.CandidateProfileRepository;
import com.smartmatch.infrastructure.persistence.jpa.CandidateProfileJpaEntity;
import com.smartmatch.infrastructure.persistence.mapper.CandidateProfileMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class CandidateProfileRepositoryImpl implements CandidateProfileRepository {

    private final CandidateProfileJpaRepository jpaRepository;
    private final CandidateProfileMapper mapper;

    @Override
    public CandidateProfile save(CandidateProfile profile) {
        CandidateProfileJpaEntity entity = mapper.toEntity(profile);

        // Đảm bảo thời gian tạo và cập nhật được set đúng
        if (entity.getCreatedAt() == null) {
            entity.setCreatedAt(LocalDateTime.now());
        }
        entity.setUpdatedAt(LocalDateTime.now());

        CandidateProfileJpaEntity saved = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }

    // 1. Lấy danh sách TẤT CẢ các hồ sơ (Tab) của một ứng viên
    @Override
    public List<CandidateProfile> findAllByCandidateId(Long candidateId) {
        return jpaRepository.findAllByCandidateId(candidateId).stream()
                .map(mapper::toDomain)
                .toList();
    }

    // 2. Lấy chi tiết MỘT hồ sơ cụ thể dựa vào ID của hồ sơ đó (Dùng khi Edit/Cập nhật)
    @Override
    public Optional<CandidateProfile> findById(Long id) {
        return jpaRepository.findById(id)
                .map(mapper::toDomain);
    }
}