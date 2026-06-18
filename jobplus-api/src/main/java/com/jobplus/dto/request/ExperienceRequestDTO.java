package com.jobplus.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ExperienceRequestDTO {
    @NotBlank private String title;
    @NotBlank private String companyName;
    private String location;
    private String startDate;
    private String endDate;
    private Boolean current;
    private String description;
}
