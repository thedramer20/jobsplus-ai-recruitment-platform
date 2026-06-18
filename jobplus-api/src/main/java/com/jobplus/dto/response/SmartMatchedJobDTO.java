package com.jobplus.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SmartMatchedJobDTO {
    private JobResponseDTO job;
    private SmartMatchResultDTO match;
}
