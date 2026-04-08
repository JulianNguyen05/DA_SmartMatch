package com.smartmatch.application.dto.job;

import com.smartmatch.domain.common.enums.ExperienceLevel;
import com.smartmatch.domain.common.enums.JobType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Yêu cầu tìm kiếm tin tuyển dụng")
public class JobSearchRequest {

    private String keyword;
    private String location;
    private JobType jobType;
    private ExperienceLevel experienceLevel;

    @PositiveOrZero
    private BigDecimal minSalary;

    @PositiveOrZero
    private BigDecimal maxSalary;

    private Integer page = 0;
    private Integer size = 20;
}