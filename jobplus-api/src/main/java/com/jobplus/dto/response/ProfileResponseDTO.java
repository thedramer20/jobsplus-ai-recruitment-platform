package com.jobplus.dto.response;

import com.jobplus.model.Role;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ProfileResponseDTO {
    private Long id;
    private String email;
    private String name;
    private String headline;
    private String avatarUrl;
    private String location;
    private Role role;
    private String bio;
    private Integer yearsExperience;
    private String educationSummary;
    private String resumeUrl;
    private Boolean openToWork;
    private String bannerGradient;
    private List<ExperienceDTO> experiences;
    private List<EducationDTO> educations;
    private List<SkillDTO> skills;
}
