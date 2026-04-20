// backend-core/domain/src/main/java/com/smartmatch/domain/job/model/Job.java
package com.smartmatch.domain.job.model;

import com.smartmatch.domain.common.enums.ExperienceLevel;
import com.smartmatch.domain.common.enums.JobStatus;
import com.smartmatch.domain.common.enums.JobType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Job {
    private Long id;
    private String title;
    private String description;
    private Long companyId;
    private String location;
    private BigDecimal minSalary;
    private BigDecimal maxSalary;
    private String currency;
    private JobType jobType;
    private ExperienceLevel experienceLevel;
    private Integer minExperienceYears;
    private List<String> requirements;
    private List<String> benefits;
    private LocalDateTime postedAt;
    private LocalDate deadline;
    private JobStatus status;
    private Long postedById;
}