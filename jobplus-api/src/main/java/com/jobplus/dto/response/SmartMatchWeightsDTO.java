package com.jobplus.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SmartMatchWeightsDTO {
    private int skillMatch;
    private int experienceMatch;
    private int educationMatch;
    private int locationMatch;
    private int keywordRelevance;
    private int profileCompleteness;
}
