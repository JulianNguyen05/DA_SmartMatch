package com.worklify.domain.candidate.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
@EqualsAndHashCode(of = {"candidateId", "skillId"}) // định danh theo khóa hỗn hợp, không phụ thuộc field mutable
public class CandidateSkill {
    private final Long candidateId;
    private final Long skillId;
    private String level;
    private Integer yearsOfEx;
    private String note;
    // [MỚI - Tiến độ 6] Vị trí hiển thị, phục vụ kéo-thả sắp xếp skill trên ProfilePage
    private int displayOrder;

    public CandidateSkill(Long candidateId, Long skillId) {
        this.candidateId = candidateId;
        this.skillId = skillId;
        this.level = "";
        this.yearsOfEx = 0;
        this.note = "";
        this.displayOrder = 0;
    }

    // Business Behavior: kéo-thả đổi vị trí skill trong danh sách
    public void reorder(int newPosition) {
        if (newPosition < 0) {
            throw new IllegalArgumentException("displayOrder không được âm");
        }
        this.displayOrder = newPosition;
    }
}