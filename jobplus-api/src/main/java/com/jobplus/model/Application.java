package com.jobplus.model;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Application {
    private Long              id;
    private Long              jobId;
    private Long              seekerId;
    private ApplicationStatus status;
    private String            coverLetter;
    private String            resumeUrl;
    private LocalDateTime     appliedAt;
    private LocalDateTime     updatedAt;
}
