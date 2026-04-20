// backend-core/application/src/main/java/com/smartmatch/application/dto/job/CreateJobRequest.java
package com.smartmatch.application.dto.job;

import com.smartmatch.domain.common.enums.ExperienceLevel;
import com.smartmatch.domain.common.enums.JobType;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateJobRequest {

    @NotBlank(message = "Tiêu đề không được để trống")
    @Size(max = 200, message = "Tiêu đề tối đa 200 ký tự")
    private String title;

    @NotBlank(message = "Mô tả không được để trống")
    @Size(max = 5000, message = "Mô tả tối đa 5000 ký tự")
    private String description;

    @NotBlank(message = "Địa điểm không được để trống")
    private String location;

    @PositiveOrZero(message = "Lương tối thiểu phải ≥ 0")
    private BigDecimal minSalary;

    @PositiveOrZero(message = "Lương tối đa phải ≥ 0")
    private BigDecimal maxSalary;

    private String currency = "VND";

    @NotNull(message = "Loại hình làm việc không được để trống")
    private JobType jobType;

    @NotNull(message = "Mức kinh nghiệm không được để trống")
    private ExperienceLevel experienceLevel;

    @Min(value = 0, message = "Số năm kinh nghiệm không được âm")
    private Integer minExperienceYears;

    private List<String> requirements;

    private List<String> benefits;

    @FutureOrPresent(message = "Hạn nộp phải là ngày hiện tại hoặc tương lai")
    private LocalDate deadline;
}