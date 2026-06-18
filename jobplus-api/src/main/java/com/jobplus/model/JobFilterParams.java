package com.jobplus.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobFilterParams {
    private String       keyword;
    private String       location;
    private String       employmentType;
    private String       experienceLevel;
    private BigDecimal   salaryMin;
    private BigDecimal   salaryMax;
    private Boolean      remote;
    private Long         companyId;
    private Integer      postedWithinDays;
    private List<Long>   skillIds;
    private int          page;
    private int          size;
    private int          offset;
}
