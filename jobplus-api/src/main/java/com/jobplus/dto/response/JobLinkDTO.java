package com.jobplus.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class JobLinkDTO {
    private Long   id;
    private String title;
    private String company;
    private String location;
    private String type;
    private String salaryRange;
}
