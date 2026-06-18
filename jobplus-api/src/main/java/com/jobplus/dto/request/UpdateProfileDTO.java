package com.jobplus.dto.request;

import lombok.Data;

@Data
public class UpdateProfileDTO {
    private String bio;
    private Integer yearsExperience;
    private String educationSummary;
    private String resumeUrl;
    private Boolean openToWork;
    private String bannerGradient;
}
