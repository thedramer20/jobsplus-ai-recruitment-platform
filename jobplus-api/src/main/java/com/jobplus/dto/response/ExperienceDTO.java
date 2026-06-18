package com.jobplus.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ExperienceDTO {
    private Long id;
    private Long userId;
    private String title;
    private String companyName;
    private String location;
    private String startDate;
    private String endDate;
    private Boolean current;
    private String description;
    private String createdAt;
}
