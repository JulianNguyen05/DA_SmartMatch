package com.smartmatch.application.dto.job;

import com.smartmatch.domain.common.enums.ExperienceLevel;
import com.smartmatch.domain.common.enums.JobType;
import lombok.*;

import java.math.BigDecimal;

/**
 * DTO dùng cho tìm kiếm & lọc tin tuyển dụng công khai
 * Dùng trong endpoint /api/public/jobs/search
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobSearchRequest {

    private String keyword;                    // Tìm trong title hoặc description
    private String location;                   // Ví dụ: "TP.HCM", "Hà Nội", "Đà Nẵng"
    private JobType jobType;
    private ExperienceLevel experienceLevel;

    private BigDecimal minSalary;
    private BigDecimal maxSalary;

    // Phân trang cơ bản (có thể nâng cấp sau với Pageable)
    private Integer page = 0;
    private Integer size = 20;
}