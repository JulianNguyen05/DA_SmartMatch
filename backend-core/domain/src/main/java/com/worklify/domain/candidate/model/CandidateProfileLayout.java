// CandidateProfileLayout.java
package com.worklify.domain.candidate.model;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * Cấu hình vị trí + trạng thái hiển thị của MỘT block trên trang ProfilePage.
 *
 * Đây là entity thuộc về "trình bày" (layout), hoàn toàn tách biệt với dữ liệu
 * nghiệp vụ trong Activity/Award/Education/... — CV Builder sau này sẽ đọc thẳng
 * dữ liệu nghiệp vụ qua các Repository tương ứng, KHÔNG phụ thuộc vào layout này.
 */
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

    private final Long id;
    private final Long candidateId;
    private final BlockType blockType;
    private int position;
    private boolean visible;

    private CandidateProfileLayout(Long id, Long candidateId, BlockType blockType,
                                   int position, boolean visible) {
        this.id = id;
        this.candidateId = candidateId;
        this.blockType = blockType;
        this.position = position;
        this.visible = visible;
    }

    /** Tạo 1 layout item mới (chưa có id). */
    public static CandidateProfileLayout create(Long candidateId, BlockType blockType,
                                                int position, boolean visible) {
        if (candidateId == null) {
            throw new IllegalArgumentException("candidateId không được null");
        }
        if (blockType == null) {
            throw new IllegalArgumentException("blockType không được null");
        }
        return new CandidateProfileLayout(null, candidateId, blockType, position, visible);
    }

    /** Dựng lại từ persistence (đã có id). */
    public static CandidateProfileLayout restore(Long id, Long candidateId, BlockType blockType,
                                                 int position, boolean visible) {
        if (id == null) {
            throw new IllegalArgumentException("id không được null khi restore");
        }
        return new CandidateProfileLayout(id, candidateId, blockType, position, visible);
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

    public Long getId() {
        return id;
    }

    public Long getCandidateId() {
        return candidateId;
    }

    public BlockType getBlockType() {
        return blockType;
    }

    public int getPosition() {
        return position;
    }

    public boolean isVisible() {
        return visible;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof CandidateProfileLayout that)) return false;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}