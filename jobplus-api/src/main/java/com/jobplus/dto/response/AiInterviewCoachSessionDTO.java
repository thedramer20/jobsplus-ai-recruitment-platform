package com.jobplus.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class AiInterviewCoachSessionDTO {
    private String title;
    private String intro;
    private List<AiInterviewQuestionDTO> questions;
    private List<String> preparationTips;
}
