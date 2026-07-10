// CandidateProfileLayout.java
package com.worklify.domain.candidate.model;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.ArrayList;
import java.util.List;

/**
 * Cấu hình vị trí + trạng thái hiển thị của MỘT block trên trang ProfilePage.
 *
 * Đây là entity thuộc về "trình bày" (layout), tách biệt với dữ liệu nghiệp vụ
 * trong Activity/Award/Education/... — CV Builder đọc thẳng dữ liệu nghiệp vụ
 * qua các Repository tương ứng, KHÔNG phụ thuộc vào layout này.
 */
@Getter
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class CandidateProfileLayout {

    /** Thứ tự mặc định khi khởi tạo layout lần đầu cho 1 candidate. */
    private static final List<BlockType> DEFAULT_ORDER = List.of(
            BlockType.PERSONAL_INFO,
            BlockType.AVATAR,
            BlockType.SOCIAL_LINKS,
            BlockType.EXPERIENCE,
            BlockType.EDUCATION,
            BlockType.SKILL,
            BlockType.PROJECT,
            BlockType.CERTIFICATION,
            BlockType.AWARD,
            BlockType.ACTIVITY,
            BlockType.LANGUAGE,
            BlockType.HOBBY
    );

    private Long id;
    private Long candidateId;
    private BlockType blockType;
    private int position;
    private boolean visible;

    public static CandidateProfileLayout create(Long candidateId, BlockType blockType,
                                                int position, boolean visible) {
        if (candidateId == null) {
            throw new IllegalArgumentException("candidateId không được null");
        }
        if (blockType == null) {
            throw new IllegalArgumentException("blockType không được null");
        }
        return CandidateProfileLayout.builder()
                .candidateId(candidateId)
                .blockType(blockType)
                .position(position)
                .visible(visible)
                .build();
    }

    /**
     * Sinh bộ layout mặc định (đủ 12 block, visible=true) cho 1 candidate mới —
     * dùng khi candidate mở ProfilePage lần đầu và chưa có layout nào trong DB.
     */
    public static List<CandidateProfileLayout> defaultFor(Long candidateId) {
        if (candidateId == null) {
            throw new IllegalArgumentException("candidateId không được null");
        }
        List<CandidateProfileLayout> layouts = new ArrayList<>();
        int position = 0;
        for (BlockType type : DEFAULT_ORDER) {
            layouts.add(CandidateProfileLayout.create(candidateId, type, position++, true));
        }
        return layouts;
    }

    // Business Behavior: kéo-thả đổi vị trí block trên trang
    public void reorder(int newPosition) {
        if (newPosition < 0) {
            throw new IllegalArgumentException("position không được âm");
        }
        this.position = newPosition;
    }

    // Business Behavior: ẩn/hiện cả block
    public void toggleVisibility(boolean visible) {
        this.visible = visible;
    }
}