package com.jobplus.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class SmartMatchResultDTO {
    private String algorithmName;
    private String algorithmVersion;
    private String formula;
    private int finalScore;
    private String verdict;
    private String summary;
    private SmartMatchWeightsDTO weights;
    private SmartMatchBreakdownDTO breakdown;
    private List<String> strengths;
    private List<String> matchedKeywords;
    private List<String> missingSkills;
    private List<String> recommendations;
}
