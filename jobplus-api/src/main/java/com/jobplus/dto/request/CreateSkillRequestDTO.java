package com.jobplus.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateSkillRequestDTO {
    @NotBlank
    private String name;
}
