package com.jobplus.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobResponseDTO {
    private Long               id;
    private String             title;
    private String             description;
    private String             location;
    private String             employmentType;
    private String             experienceLevel;
    private BigDecimal         salaryMin;
    private BigDecimal         salaryMax;
    private String             status;
    private String             postedAt;
    private String             deadline;
    private String             updatedAt;
    private Long               postedBy;
    private CompanyResponseDTO company;
    private Boolean            savedByCurrentUser;
    private Boolean            appliedByCurrentUser;
}
