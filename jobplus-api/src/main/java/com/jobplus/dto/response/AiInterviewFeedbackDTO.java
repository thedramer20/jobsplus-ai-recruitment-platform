package com.jobplus.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class AiInterviewFeedbackDTO {
    private int score;
    private String summary;
    private List<String> strengths;
    private List<String> improvements;
    private String improvedAnswerTip;
}
