package com.jobplus.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyResponseDTO {
    private Long    id;
    private String  name;
    private String  logoUrl;
    private String  industry;
    private String  size;
    private String  location;
    private String  website;
    private String  description;
    private Boolean verified;
    private String  createdAt;
    private int     jobCount;
}
