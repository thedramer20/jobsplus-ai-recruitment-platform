package com.jobplus.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateCompanyDTO {
    @NotBlank
    private String name;

    private String logoUrl;
    private String industry;
    private String size;
    private String location;
    private String website;
    private String description;
}
