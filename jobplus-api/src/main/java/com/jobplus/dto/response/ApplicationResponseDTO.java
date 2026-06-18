package com.jobplus.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ApplicationResponseDTO {
    private Long           id;
    private Long           jobId;
    private Long           seekerId;
    private String         status;
    private String         coverLetter;
    private String         resumeUrl;
    private String         appliedAt;
    private String         updatedAt;
    private JobResponseDTO job;
    private UserResponseDTO seeker;
}
