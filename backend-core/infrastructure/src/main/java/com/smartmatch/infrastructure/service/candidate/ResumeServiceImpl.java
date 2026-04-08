package com.smartmatch.infrastructure.service.candidate;

import com.smartmatch.application.dto.candidate.ResumeResponse;
import com.smartmatch.application.service.candidate.ResumeService;
import com.smartmatch.domain.user.model.Resume;
import com.smartmatch.domain.user.repository.ResumeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ResumeServiceImpl implements ResumeService {

    private final ResumeRepository resumeRepository;
    private final com.smartmatch.application.mapper.ResumeMapper appMapper;

    private final Path uploadDir = Paths.get("uploads/resumes");

    @Override
    public ResumeResponse uploadResume(MultipartFile file, Long candidateId) throws IOException {
        if (file.isEmpty()) throw new IllegalArgumentException("File rỗng!");

        // Tạo thư mục nếu chưa có
        if (!Files.exists(uploadDir)) Files.createDirectories(uploadDir);

        String originalName = file.getOriginalFilename();
        String extension = originalName.substring(originalName.lastIndexOf("."));
        String newFileName = UUID.randomUUID() + extension;

        Path filePath = uploadDir.resolve(newFileName);
        Files.copy(file.getInputStream(), filePath);

        String fileUrl = "/uploads/resumes/" + newFileName;

        Resume resume = Resume.builder()
                .candidateId(candidateId)
                .fileName(originalName)
                .fileUrl(fileUrl)
                .fileType(file.getContentType())
                .fileSize(file.getSize())
                .uploadedAt(LocalDateTime.now())
                .build();

        Resume saved = resumeRepository.save(resume);
        return appMapper.toResponse(saved);
    }

    @Override
    public List<ResumeResponse> getMyResumes(Long candidateId) {
        List<Resume> resumes = resumeRepository.findAllByCandidateId(candidateId);
        return resumes.stream().map(appMapper::toResponse).toList();
    }

    @Override
    public void deleteResume(Long resumeId, Long candidateId) throws IOException {
        Resume resume = resumeRepository.findById(resumeId) // Bạn cần thêm findById vào ResumeRepository
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy CV!"));

        if (!resume.getCandidateId().equals(candidateId)) {
            throw new IllegalArgumentException("Bạn không có quyền xóa CV này!");
        }

        // Xóa file vật lý
        Path filePath = uploadDir.resolve(resume.getFileUrl().substring(resume.getFileUrl().lastIndexOf("/") + 1));
        Files.deleteIfExists(filePath);

        // Xóa record trong DB (Cần thêm hàm deleteById vào ResumeRepository và ResumeJpaRepository)
        resumeRepository.deleteById(resumeId);
    }
}