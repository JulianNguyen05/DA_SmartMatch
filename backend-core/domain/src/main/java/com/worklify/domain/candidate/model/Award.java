// Award.java
package com.worklify.domain.candidate.model;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import java.time.LocalDate;

@Getter
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class Award {
    private Long id;
    private Long candidateId;
    private String title;
    private String issuer;
    private LocalDate awardedDate;
    private String description;
    private int displayOrder;

    public static Award create(Long candidateId, String title) {
        if (candidateId == null || title == null || title.trim().isEmpty()) {
            throw new IllegalArgumentException("Tên giải thưởng không được để trống.");
        }
        return Award.builder().candidateId(candidateId).title(title).displayOrder(0).build();
    }

    public void updateDetails(String title, String issuer, LocalDate awardedDate,
                              String description, int displayOrder) {
        if (title == null || title.trim().isEmpty()) {
            throw new IllegalArgumentException("Tên giải thưởng không được để trống.");
        }
        this.title = title;
        this.issuer = issuer;
        this.awardedDate = awardedDate;
        this.description = description;
        this.displayOrder = displayOrder;
    }
}