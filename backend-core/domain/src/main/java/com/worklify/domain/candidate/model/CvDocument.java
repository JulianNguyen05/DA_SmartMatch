package com.worklify.domain.candidate.model;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class CvDocument {
    private Long id;
    private Long candidateId;
    private String filePath;
    private String fileName;
    private String thumbnailPath;
    private String rawText;
    private Boolean isGenerated;
    private LocalDateTime createdAt;

    // Factory Method: Ứng viên tải CV file lên
    public static CvDocument upload(Long candidateId, String filePath, String fileName, String rawText) {
        return CvDocument.builder()
                .candidateId(candidateId)
                .filePath(filePath)
                .fileName(fileName)
                .rawText(rawText)
                .isGenerated(false)
                .createdAt(LocalDateTime.now())
                .build();
    }

    // Factory Method: Ứng viên tạo CV từ template có file đính kèm
    public static CvDocument generateFromTemplate(Long candidateId, String filePath, String fileName, String rawText) {
        return CvDocument.builder()
                .candidateId(candidateId)
                .filePath(filePath)
                .fileName(fileName)
                .rawText(rawText)
                .isGenerated(true)
                .createdAt(LocalDateTime.now())
                .build();
    }

    // Factory Method: Ứng viên tạo CV từ CV Builder
    public static CvDocument generate(Long candidateId, String fileName, String rawText) {
        return CvDocument.builder()
                .candidateId(candidateId)
                .filePath(null)
                .fileName(fileName)
                .thumbnailPath(null)
                .rawText(rawText)
                .isGenerated(true)
                .createdAt(LocalDateTime.now())
                .build();
    }

    // [ĐÃ SỬA] Logic đổi tên
    public void rename(String newName) {
        if (newName == null || newName.trim().isEmpty()) {
            throw new IllegalArgumentException("Tên CV không được để trống.");
        }
        this.fileName = newName;
    }

    public void updateThumbnail(String path) {
        this.thumbnailPath = path;
    }

    public void updateRawText(String rawText) {
        this.rawText = rawText;
    }
}