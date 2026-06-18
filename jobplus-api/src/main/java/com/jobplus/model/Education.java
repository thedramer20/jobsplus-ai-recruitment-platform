package com.jobplus.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Education {
    private Long id;
    private Long userId;
    private String school;
    private String degree;
    private String fieldOfStudy;
    private Integer startYear;
    private Integer endYear;
    private LocalDateTime createdAt;
}
