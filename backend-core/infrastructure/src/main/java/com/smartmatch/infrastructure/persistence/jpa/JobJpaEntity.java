package com.smartmatch.infrastructure.persistence.jpa;

import com.smartmatch.domain.common.enums.ExperienceLevel;
import com.smartmatch.domain.common.enums.JobStatus;
import com.smartmatch.domain.common.enums.JobType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "jobs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobJpaEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    @Column(columnDefinition = "TEXT")
    private String description;

    private Long companyId;
    private String location;

    private BigDecimal minSalary;
    private BigDecimal maxSalary;
    private String currency;

    @Enumerated(EnumType.STRING)
    private JobType jobType;

    @Enumerated(EnumType.STRING)
    private ExperienceLevel experienceLevel;

    private Integer minExperienceYears;

    @ElementCollection
    @CollectionTable(name = "job_requirements", joinColumns = @JoinColumn(name = "job_id"))
    @Column(name = "requirement")
    private List<String> requirements;

    @ElementCollection
    @CollectionTable(name = "job_benefits", joinColumns = @JoinColumn(name = "job_id"))
    @Column(name = "benefit")
    private List<String> benefits;

    private LocalDateTime postedAt;
    private LocalDate deadline;

    @Enumerated(EnumType.STRING)
    private JobStatus status;

    private Long postedById;
}