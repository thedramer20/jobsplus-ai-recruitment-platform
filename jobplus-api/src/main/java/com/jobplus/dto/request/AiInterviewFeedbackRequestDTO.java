package com.jobplus.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AiInterviewFeedbackRequestDTO {
    private Long jobId;
    private String roleTitle;

    @NotBlank
    private String question;

    @NotBlank
    private String answer;
}
