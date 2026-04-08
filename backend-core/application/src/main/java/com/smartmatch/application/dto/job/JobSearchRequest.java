package com.smartmatch.application.dto.job;

import com.smartmatch.domain.common.enums.ExperienceLevel;
import com.smartmatch.domain.common.enums.JobType;
import lombok.*;

import java.math.BigDecimal;

/**
 * DTO tìm kiếm tin tuyển dụng (filter + phân trang)
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobSearchRequest {

    private String keyword;
    private String location;
    private JobType jobType;
    private ExperienceLevel experienceLevel;

    private BigDecimal minSalary;
    private BigDecimal maxSalary;

    // Mặc định phân trang
    private Integer page = 0;
    private Integer size = 20;
}