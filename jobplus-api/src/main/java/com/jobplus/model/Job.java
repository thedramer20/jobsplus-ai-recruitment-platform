package com.jobplus.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Job {
    private Long            id;
    private Long            companyId;
    private Long            postedBy;
    private String          title;
    private String          description;
    private String          location;
    private EmploymentType  employmentType;
    private ExperienceLevel experienceLevel;
    private BigDecimal      salaryMin;
    private BigDecimal      salaryMax;
    private JobStatus       status;
    private LocalDateTime   postedAt;
    private LocalDate       deadline;
    private LocalDateTime   updatedAt;
}
