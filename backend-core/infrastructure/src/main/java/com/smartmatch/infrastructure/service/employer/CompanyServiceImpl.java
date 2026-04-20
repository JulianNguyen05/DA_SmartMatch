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
import java.nio.file.StandardCopyOption;
import java.util.Optional;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class CompanyServiceImpl implements CompanyService {

    private final CompanyRepository companyRepository;
    private final CompanyMapper companyMapper;

    // Đường dẫn thư mục lưu trữ (Docker Volume sẽ mount vào đây)
    private final Path uploadDir = Paths.get("uploads/companies/logos");

    @Override
    public CompanyResponse createOrUpdateCompany(CreateCompanyRequest request, Long ownerId) {
        Optional<Company> existingOpt = companyRepository.findByOwnerId(ownerId);

        Company company;
        if (existingOpt.isPresent()) {
            company = existingOpt.get();
            company.setName(request.getName());
            company.setDescription(request.getDescription());
            company.setAddress(request.getAddress());
            company.setLocation(request.getLocation());
            company.setWebsite(request.getWebsite());
            company.setLogoUrl(request.getLogoUrl());
            company.setIndustry(request.getIndustry());
            company.setCompanySize(request.getCompanySize());
        } else {
            company = companyMapper.toDomain(request, ownerId);
        }

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

        // 1. Đảm bảo thư mục tồn tại
        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
        }

        // 2. Định nghĩa tên file cố định: "logo_owner_[ID]"
        // Việc dùng tên cố định giúp ta dễ dàng ghi đè hoặc tìm kiếm để xóa.
        String fileNameBase = "logo_owner_" + ownerId;
        String originalName = file.getOriginalFilename();
        String extension = originalName != null && originalName.contains(".")
                ? originalName.substring(originalName.lastIndexOf("."))
                : ".png";

        String newFileName = fileNameBase + extension;
        Path targetPath = uploadDir.resolve(newFileName);

        // 3. Xử lý THAY THẾ (Xóa các file cũ cùng tên nhưng có thể khác đuôi)
        // Ví dụ: Nếu cũ là logo_owner_1.jpg, mới là logo_owner_1.png -> phải xóa .jpg đi
        try (Stream<Path> files = Files.list(uploadDir)) {
            files.filter(path -> path.getFileName().toString().startsWith(fileNameBase))
                    .forEach(path -> {
                        try {
                            Files.deleteIfExists(path);
                        } catch (IOException e) {
                            // Log lỗi nếu cần thiết
                        }
                    });
        }

        // 4. Lưu file mới (StandardCopyOption.REPLACE_EXISTING để chắc chắn)
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        // 5. Trả về URL tương đối để lưu vào DB
        return "/uploads/companies/logos/" + newFileName;
    }
}