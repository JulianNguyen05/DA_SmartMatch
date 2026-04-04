package com.smartmatch.infrastructure.persistence.repository;

import com.smartmatch.domain.company.model.Company;
import com.smartmatch.domain.company.repository.CompanyRepository;
import com.smartmatch.infrastructure.persistence.jpa.CompanyJpaEntity;
import com.smartmatch.infrastructure.persistence.mapper.CompanyMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class CompanyRepositoryImpl implements CompanyRepository {

    private final CompanyJpaRepository jpaRepository;
    private final CompanyMapper mapper;

    @Override
    public Company save(Company company) {
        CompanyJpaEntity entity = mapper.toEntity(company);
        if (entity.getCreatedAt() == null) {
            entity.setCreatedAt(LocalDateTime.now());
        }
        CompanyJpaEntity saved = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<Company> findById(Long id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public Optional<Company> findByOwnerId(Long ownerId) {
        return jpaRepository.findByOwnerId(ownerId).map(mapper::toDomain);
    }
}