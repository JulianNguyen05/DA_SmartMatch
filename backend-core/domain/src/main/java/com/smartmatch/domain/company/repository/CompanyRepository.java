package com.smartmatch.domain.company.repository;

import com.smartmatch.domain.company.model.Company;

import java.util.Optional;

public interface CompanyRepository {
    Company save(Company company);
    Optional<Company> findById(Long id);
    Optional<Company> findByOwnerId(Long ownerId);
}