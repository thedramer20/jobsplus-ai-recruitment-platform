package com.jobplus.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class AiJobMatchDTO {
    private int score;
    private String verdict;
    private String summary;
    private List<String> matchingStrengths;
    private List<String> gaps;
    private List<String> recommendations;
}
