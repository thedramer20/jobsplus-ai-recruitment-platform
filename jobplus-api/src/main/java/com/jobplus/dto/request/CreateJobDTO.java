package com.jobplus.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class CreateJobDTO {
    @NotBlank
    private String title;

    @NotBlank
    private String description;

    private String location;

    @NotNull
    private String employmentType;

    @NotNull
    private String experienceLevel;

    private BigDecimal  salaryMin;
    private BigDecimal  salaryMax;
    private String      deadline;
    private List<Long>  skillIds;
}
