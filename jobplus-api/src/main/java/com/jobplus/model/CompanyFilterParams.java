package com.jobplus.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyFilterParams {
    private String  industry;
    private String  size;       // company size: STARTUP, SMALL, MEDIUM, LARGE, ENTERPRISE
    private String  location;
    private Boolean verified;
    private int     page;
    private int     pageSize;
    private int     offset;
}
