package com.smartmatch.application.dto.job;

import com.smartmatch.domain.common.enums.ExperienceLevel;
import com.smartmatch.domain.common.enums.JobType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Yêu cầu tìm kiếm & lọc tin tuyển dụng công khai")
public class JobSearchRequest {

    @Schema(description = "Từ khóa tìm kiếm (title hoặc description)", example = "Java Spring Boot")
    private String keyword;

    @Schema(description = "Địa điểm làm việc", example = "TP.HCM")
    private String location;

    @Schema(description = "Hình thức làm việc", example = "FULL_TIME")
    private JobType jobType;

    @Schema(description = "Mức kinh nghiệm", example = "MID")
    private ExperienceLevel experienceLevel;

    @Schema(description = "Mức lương tối thiểu (VND)", example = "15000000")
    private BigDecimal minSalary;

    @Schema(description = "Mức lương tối đa (VND)", example = "30000000")
    private BigDecimal maxSalary;

    @Schema(description = "Trang hiện tại (bắt đầu từ 0)", example = "0", defaultValue = "0")
    private Integer page = 0;

    @Schema(description = "Số tin mỗi trang", example = "20", defaultValue = "20")
    private Integer size = 20;
}