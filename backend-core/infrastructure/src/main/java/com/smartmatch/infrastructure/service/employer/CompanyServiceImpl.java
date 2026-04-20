package com.smartmatch.infrastructure.service.employer;

import com.smartmatch.application.dto.company.CompanyResponse;
import com.smartmatch.application.dto.company.CreateCompanyRequest;
import com.smartmatch.application.mapper.CompanyMapper;
import com.smartmatch.application.service.employer.CompanyService;
import com.smartmatch.domain.company.model.Company;
import com.smartmatch.domain.company.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CompanyServiceImpl implements CompanyService {

    private final CompanyRepository companyRepository;
    private final CompanyMapper companyMapper;

    @Override
    public CompanyResponse createOrUpdateCompany(CreateCompanyRequest request, Long ownerId) {
        // Kiểm tra công ty đã tồn tại chưa
        Optional<Company> existingOpt = companyRepository.findByOwnerId(ownerId);

        Company company;
        if (existingOpt.isPresent()) {
            // Update
            company = existingOpt.get();
            // Cập nhật các field từ request
            company.setName(request.getName());
            company.setDescription(request.getDescription());
            company.setAddress(request.getAddress());
            company.setLocation(request.getLocation());
            company.setWebsite(request.getWebsite());
            company.setLogoUrl(request.getLogoUrl());
            company.setIndustry(request.getIndustry());
            company.setCompanySize(request.getCompanySize());
            // createdAt giữ nguyên
        } else {
            // Create mới
            company = companyMapper.toDomain(request, ownerId);
        }

        // Lưu vào DB
        Company savedCompany = companyRepository.save(company);

        return companyMapper.toResponse(savedCompany);
    }

    @Override
    public CompanyResponse getCompanyByOwnerId(Long ownerId) {
        Optional<Company> companyOpt = companyRepository.findByOwnerId(ownerId);
        if (companyOpt.isEmpty()) {
            throw new IllegalArgumentException("Bạn chưa tạo thông tin công ty. Vui lòng tạo Company trước!");
        }
        return companyMapper.toResponse(companyOpt.get());
    }
    @Override
    public CompanyResponse getCompanyById(Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy công ty!"));
        return companyMapper.toResponse(company);
    }

    @Override
    public String uploadLogo(MultipartFile file, Long ownerId) throws IOException {
        if (file.isEmpty()) throw new IllegalArgumentException("File ảnh rỗng!");

        // 1. Sửa lại đường dẫn khớp với yêu cầu và Docker Volume
        // Dùng đường dẫn tương đối tính từ gốc /app của container
        Path uploadDir = Paths.get("uploads/companies/logos");

        // Tạo thư mục nếu chưa tồn tại
        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
        }

        String originalName = file.getOriginalFilename();
        String extension = originalName != null ? originalName.substring(originalName.lastIndexOf(".")) : ".png";
        String newFileName = UUID.randomUUID() + extension;

        Path filePath = uploadDir.resolve(newFileName);
        Files.copy(file.getInputStream(), filePath);

        // 2. Trả về đường dẫn tương đối
        // Frontend sẽ tự nối http://localhost:8080 thông qua biến môi trường hoặc proxy
        return "/uploads/companies/logos/" + newFileName;
    }
}