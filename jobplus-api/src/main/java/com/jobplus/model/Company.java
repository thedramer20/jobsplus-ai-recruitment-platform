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
public class Company {
    private Long          id;
    private String        name;
    private String        logoUrl;
    private String        industry;
    private CompanySize   size;
    private String        location;
    private String        website;
    private String        description;
    private Boolean       verified;
    private LocalDateTime createdAt;
}
