package com.worklify.infrastructure.storage;

import com.worklify.application.common.port.FileStoragePort;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.FileSystemUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.Objects;

@Slf4j
@Service
public class LocalFileStorageService implements FileStoragePort {

    @Value("${application.storage.local.upload-dir:./uploads}")
    private String uploadDir;

    private Path rootLocation;

    @PostConstruct
    public void init() {
        this.rootLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.rootLocation);
            log.info("Đã khởi tạo thư mục lưu trữ gốc tại: {}", this.rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("Không thể khởi tạo thư mục lưu trữ. Lỗi: " + e.getMessage(), e);
        }
    }

    @Override
    public String storeFile(MultipartFile file, String subDirectory, String prefix) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Không thể lưu file rỗng.");
        }

        String originalFilename = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        if (originalFilename.contains("..")) {
            throw new IllegalArgumentException("Tên file chứa ký tự đường dẫn không hợp lệ: " + originalFilename);
        }

        String safeOriginalName = originalFilename.replaceAll("\\s+", "_");
        String finalFileName = prefix + "_" + safeOriginalName;

        try {
            Path targetLocation = this.rootLocation.resolve(subDirectory);
            Files.createDirectories(targetLocation);

            Path targetFile = targetLocation.resolve(finalFileName);
            Files.copy(file.getInputStream(), targetFile, StandardCopyOption.REPLACE_EXISTING);

            log.info("Lưu file thành công: {}", targetFile);

            return subDirectory + "/" + finalFileName;

        } catch (IOException ex) {
            throw new RuntimeException("Không thể lưu trữ file " + originalFilename + ". Lỗi: " + ex.getMessage(), ex);
        }
    }

    @Override
    public String storeFile(MultipartFile file, String category, String subFolder, String customFileName) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Không thể lưu file rỗng.");
        }

        try {
            // Tạo thư mục phân cấp (VD: uploads/cv_thumbnails/11)
            Path targetLocation = this.rootLocation.resolve(category).resolve(subFolder);
            Files.createDirectories(targetLocation);

            // Ghép tên file (VD: 38.jpg)
            Path targetFile = targetLocation.resolve(customFileName);

            // StandardCopyOption.REPLACE_EXISTING giúp ghi đè nếu user bấm xem trước nhiều lần
            Files.copy(file.getInputStream(), targetFile, StandardCopyOption.REPLACE_EXISTING);

            log.info("Lưu file thành công theo cấu trúc phân cấp: {}", targetFile);

            return category + "/" + subFolder + "/" + customFileName;
        } catch (IOException ex) {
            throw new RuntimeException("Không thể lưu trữ file. Lỗi: " + ex.getMessage(), ex);
        }
    }

    @Override
    public byte[] readFile(String filePath) {
        try {
            Path file = this.rootLocation.resolve(filePath).normalize();
            Resource resource = new UrlResource(file.toUri());

            if (resource.exists() && resource.isReadable()) {
                return Files.readAllBytes(file);
            } else {
                throw new RuntimeException("Không thể đọc file hoặc file không tồn tại: " + filePath);
            }
        } catch (IOException ex) {
            throw new RuntimeException("Lỗi khi đọc file: " + filePath, ex);
        }
    }

    @Override
    public void deleteFile(String filePath) {
        try {
            Path file = this.rootLocation.resolve(filePath).normalize();
            Files.deleteIfExists(file);
            log.info("Đã xóa file: {}", filePath);
        } catch (IOException ex) {
            log.error("Không thể xóa file: {}", filePath, ex);
            throw new RuntimeException("Lỗi khi xóa file: " + filePath, ex);
        }
    }

    @Override
    public void deleteUserFolder(String category, String subFolder) {
        try {
            // Xác định thư mục cần xóa (VD: uploads/cv_thumbnails/11)
            Path folderPath = this.rootLocation.resolve(category).resolve(subFolder).normalize();

            // Nếu thư mục tồn tại thì xóa sạch file bên trong và xóa luôn thư mục đó
            if (Files.exists(folderPath)) {
                FileSystemUtils.deleteRecursively(folderPath);
                log.info("Đã dọn dẹp toàn bộ thư mục: {}", folderPath);
            }
        } catch (IOException ex) {
            log.error("Không thể dọn dẹp thư mục: {}", subFolder, ex);
            throw new RuntimeException("Lỗi khi xóa thư mục: " + subFolder, ex);
        }
    }

    private String getFileExtension(String fileName) {
        if (fileName == null || fileName.lastIndexOf(".") == -1) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf(".") + 1);
    }
}