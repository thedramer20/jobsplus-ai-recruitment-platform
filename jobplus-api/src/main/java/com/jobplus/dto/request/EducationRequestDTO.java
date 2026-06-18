package com.jobplus.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class EducationRequestDTO {
    @NotBlank private String school;
    @NotBlank private String degree;
    private String fieldOfStudy;
    private Integer startYear;
    private Integer endYear;
}
