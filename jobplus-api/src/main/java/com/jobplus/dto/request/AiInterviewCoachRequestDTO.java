package com.jobplus.dto.request;

import lombok.Data;

@Data
public class AiInterviewCoachRequestDTO {
    private Long jobId;
    private String roleTitle;
    private String companyName;
    private String interviewFocus;
}
