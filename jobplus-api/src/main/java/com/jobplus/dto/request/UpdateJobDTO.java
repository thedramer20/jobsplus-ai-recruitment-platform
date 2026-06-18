package com.jobplus.dto.request;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class UpdateJobDTO {
    private String      title;
    private String      description;
    private String      location;
    private String      employmentType;
    private String      experienceLevel;
    private BigDecimal  salaryMin;
    private BigDecimal  salaryMax;
    private String      status;
    private String      deadline;
    private List<Long>  skillIds;
}
