package com.jobplus.service;

import com.jobplus.dto.request.EducationRequestDTO;
import com.jobplus.dto.request.ExperienceRequestDTO;
import com.jobplus.dto.request.UpdateProfileDTO;
import com.jobplus.dto.response.EducationDTO;
import com.jobplus.dto.response.ExperienceDTO;
import com.jobplus.dto.response.ProfileResponseDTO;
import com.jobplus.dto.response.SkillDTO;

import java.util.List;

public interface ProfileService {
    ProfileResponseDTO getById(Long userId);
    ProfileResponseDTO updateProfile(Long userId, UpdateProfileDTO dto);
    ExperienceDTO addExperience(Long userId, ExperienceRequestDTO dto);
    ExperienceDTO updateExperience(Long userId, Long expId, ExperienceRequestDTO dto);
    void deleteExperience(Long userId, Long expId);
    EducationDTO addEducation(Long userId, EducationRequestDTO dto);
    EducationDTO updateEducation(Long userId, Long eduId, EducationRequestDTO dto);
    void deleteEducation(Long userId, Long eduId);
    List<SkillDTO> getAllSkills();
    List<SkillDTO> getSkills(Long userId);
    SkillDTO createSkill(Long userId, String skillName);
    void addSkill(Long userId, Long skillId);
    void removeSkill(Long userId, Long skillId);
    void updateBannerGradient(Long userId, String gradient);
}
