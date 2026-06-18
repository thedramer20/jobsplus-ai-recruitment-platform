package com.jobplus.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SmartMatchedCandidateDTO {
    private ApplicationResponseDTO application;
    private SmartMatchResultDTO match;
}
