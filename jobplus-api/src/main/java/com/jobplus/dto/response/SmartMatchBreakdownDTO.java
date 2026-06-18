package com.jobplus.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SmartMatchBreakdownDTO {
    private int skillMatchScore;
    private int experienceMatchScore;
    private int educationMatchScore;
    private int locationMatchScore;
    private int keywordRelevanceScore;
    private int profileCompletenessScore;

    private int skillWeightedContribution;
    private int experienceWeightedContribution;
    private int educationWeightedContribution;
    private int locationWeightedContribution;
    private int keywordWeightedContribution;
    private int completenessWeightedContribution;
}
