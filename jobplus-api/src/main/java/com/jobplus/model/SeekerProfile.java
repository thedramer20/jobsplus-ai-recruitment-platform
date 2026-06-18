package com.jobplus.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeekerProfile {
    private Long userId;
    private String bio;
    private Integer yearsExperience;
    private String educationSummary;
    private String resumeUrl;
    private Boolean openToWork;
    private String bannerGradient;
    private LocalDateTime updatedAt;
}
