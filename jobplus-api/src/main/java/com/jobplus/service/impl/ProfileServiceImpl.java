package com.jobplus.service.impl;

import com.jobplus.dto.request.EducationRequestDTO;
import com.jobplus.dto.request.ExperienceRequestDTO;
import com.jobplus.dto.request.UpdateProfileDTO;
import com.jobplus.dto.response.EducationDTO;
import com.jobplus.dto.response.ExperienceDTO;
import com.jobplus.dto.response.ProfileResponseDTO;
import com.jobplus.dto.response.SkillDTO;
import com.jobplus.exception.ResourceNotFoundException;
import com.jobplus.exception.ValidationException;
import com.jobplus.mapper.EducationMapper;
import com.jobplus.mapper.ExperienceMapper;
import com.jobplus.mapper.SeekerProfileMapper;
import com.jobplus.mapper.SkillMapper;
import com.jobplus.mapper.UserMapper;
import com.jobplus.model.Education;
import com.jobplus.model.Experience;
import com.jobplus.model.SeekerProfile;
import com.jobplus.model.Skill;
import com.jobplus.model.User;
import com.jobplus.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProfileServiceImpl implements ProfileService {

    private final UserMapper          userMapper;
    private final SeekerProfileMapper seekerProfileMapper;
    private final ExperienceMapper    experienceMapper;
    private final EducationMapper     educationMapper;
    private final SkillMapper         skillMapper;

    @Override
    public ProfileResponseDTO getById(Long userId) {
        User user = userMapper.findById(userId);
        if (user == null) throw new ResourceNotFoundException("User not found");

        SeekerProfile profile = seekerProfileMapper.findByUserId(userId);

        List<ExperienceDTO> experiences = experienceMapper.findByUserId(userId)
                .stream().map(this::toExperienceDTO).toList();
        List<EducationDTO> educations = educationMapper.findByUserId(userId)
                .stream().map(this::toEducationDTO).toList();
        List<SkillDTO> skills = skillMapper.findByUserId(userId)
                .stream().map(s -> SkillDTO.builder().id(s.getId()).name(s.getName()).build()).toList();

        return ProfileResponseDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .headline(user.getHeadline())
                .avatarUrl(user.getAvatarUrl())
                .location(user.getLocation())
                .role(user.getRole())
                .bio(profile != null ? profile.getBio() : null)
                .yearsExperience(profile != null ? profile.getYearsExperience() : null)
                .educationSummary(profile != null ? profile.getEducationSummary() : null)
                .resumeUrl(profile != null ? profile.getResumeUrl() : null)
                .openToWork(profile != null ? profile.getOpenToWork() : null)
                .bannerGradient(profile != null ? profile.getBannerGradient() : null)
                .experiences(experiences)
                .educations(educations)
                .skills(skills)
                .build();
    }

    @Override
    @Transactional
    public ProfileResponseDTO updateProfile(Long userId, UpdateProfileDTO dto) {
        SeekerProfile existing = seekerProfileMapper.findByUserId(userId);
        if (existing == null) {
            seekerProfileMapper.insert(SeekerProfile.builder().userId(userId).build());
        }
        seekerProfileMapper.updateByUserId(
                SeekerProfile.builder()
                        .userId(userId)
                        .bio(dto.getBio())
                        .yearsExperience(dto.getYearsExperience())
                        .educationSummary(dto.getEducationSummary())
                        .resumeUrl(dto.getResumeUrl())
                        .openToWork(dto.getOpenToWork())
                        .build());
        return getById(userId);
    }

    @Override
    @Transactional
    public ExperienceDTO addExperience(Long userId, ExperienceRequestDTO dto) {
        Experience exp = Experience.builder()
                .userId(userId)
                .title(dto.getTitle())
                .companyName(dto.getCompanyName())
                .location(dto.getLocation())
                .startDate(dto.getStartDate() != null ? LocalDate.parse(dto.getStartDate()) : null)
                .endDate(dto.getEndDate() != null ? LocalDate.parse(dto.getEndDate()) : null)
                .current(dto.getCurrent())
                .description(dto.getDescription())
                .build();
        experienceMapper.insert(exp);
        return toExperienceDTO(exp);
    }

    @Override
    @Transactional
    public ExperienceDTO updateExperience(Long userId, Long expId, ExperienceRequestDTO dto) {
        Experience exp = Experience.builder()
                .id(expId)
                .userId(userId)
                .title(dto.getTitle())
                .companyName(dto.getCompanyName())
                .location(dto.getLocation())
                .startDate(dto.getStartDate() != null ? LocalDate.parse(dto.getStartDate()) : null)
                .endDate(dto.getEndDate() != null ? LocalDate.parse(dto.getEndDate()) : null)
                .current(dto.getCurrent())
                .description(dto.getDescription())
                .build();
        int rows = experienceMapper.updateById(exp);
        if (rows == 0) throw new ResourceNotFoundException("Experience not found");
        return toExperienceDTO(exp);
    }

    @Override
    @Transactional
    public void deleteExperience(Long userId, Long expId) {
        int rows = experienceMapper.deleteById(expId, userId);
        if (rows == 0) throw new ResourceNotFoundException("Experience not found");
    }

    @Override
    @Transactional
    public EducationDTO addEducation(Long userId, EducationRequestDTO dto) {
        Education edu = Education.builder()
                .userId(userId)
                .school(dto.getSchool())
                .degree(dto.getDegree())
                .fieldOfStudy(dto.getFieldOfStudy())
                .startYear(dto.getStartYear())
                .endYear(dto.getEndYear())
                .build();
        educationMapper.insert(edu);
        return toEducationDTO(edu);
    }

    @Override
    @Transactional
    public EducationDTO updateEducation(Long userId, Long eduId, EducationRequestDTO dto) {
        Education edu = Education.builder()
                .id(eduId)
                .userId(userId)
                .school(dto.getSchool())
                .degree(dto.getDegree())
                .fieldOfStudy(dto.getFieldOfStudy())
                .startYear(dto.getStartYear())
                .endYear(dto.getEndYear())
                .build();
        int rows = educationMapper.updateById(edu);
        if (rows == 0) throw new ResourceNotFoundException("Education not found");
        return toEducationDTO(edu);
    }

    @Override
    @Transactional
    public void deleteEducation(Long userId, Long eduId) {
        int rows = educationMapper.deleteById(eduId, userId);
        if (rows == 0) throw new ResourceNotFoundException("Education not found");
    }

    @Override
    public List<SkillDTO> getAllSkills() {
        return skillMapper.findAll().stream()
                .map(s -> SkillDTO.builder().id(s.getId()).name(s.getName()).build())
                .toList();
    }

    @Override
    public List<SkillDTO> getSkills(Long userId) {
        return skillMapper.findByUserId(userId).stream()
                .map(s -> SkillDTO.builder().id(s.getId()).name(s.getName()).build())
                .toList();
    }

    @Override
    @Transactional
    public SkillDTO createSkill(Long userId, String skillName) {
        String normalizedName = skillName != null ? skillName.trim() : "";
        if (normalizedName.isBlank()) throw new ValidationException("Skill name is required");

        Skill skill = skillMapper.findAll().stream()
                .filter(existing -> existing.getName() != null &&
                        existing.getName().trim().equalsIgnoreCase(normalizedName))
                .findFirst()
                .orElseGet(() -> {
                    Skill created = Skill.builder().name(normalizedName).build();
                    skillMapper.insert(created);
                    return created;
                });

        skillMapper.addUserSkill(userId, skill.getId());
        return SkillDTO.builder()
                .id(skill.getId())
                .name(skill.getName())
                .build();
    }

    @Override
    @Transactional
    public void addSkill(Long userId, Long skillId) {
        Skill skill = skillMapper.findById(skillId);
        if (skill == null) throw new ResourceNotFoundException("Skill not found");
        skillMapper.addUserSkill(userId, skillId);
    }

    @Override
    @Transactional
    public void removeSkill(Long userId, Long skillId) {
        skillMapper.removeUserSkill(userId, skillId);
    }

    @Override
    @Transactional
    public void updateBannerGradient(Long userId, String gradient) {
        SeekerProfile existing = seekerProfileMapper.findByUserId(userId);
        if (existing == null) {
            seekerProfileMapper.insert(SeekerProfile.builder().userId(userId).build());
        }
        seekerProfileMapper.updateBannerGradient(userId, gradient);
    }

    private ExperienceDTO toExperienceDTO(Experience e) {
        return ExperienceDTO.builder()
                .id(e.getId())
                .userId(e.getUserId())
                .title(e.getTitle())
                .companyName(e.getCompanyName())
                .location(e.getLocation())
                .startDate(e.getStartDate() != null ? e.getStartDate().toString() : null)
                .endDate(e.getEndDate() != null ? e.getEndDate().toString() : null)
                .current(e.getCurrent())
                .description(e.getDescription())
                .createdAt(e.getCreatedAt() != null ? e.getCreatedAt().toString() : null)
                .build();
    }

    private EducationDTO toEducationDTO(Education e) {
        return EducationDTO.builder()
                .id(e.getId())
                .userId(e.getUserId())
                .school(e.getSchool())
                .degree(e.getDegree())
                .fieldOfStudy(e.getFieldOfStudy())
                .startYear(e.getStartYear())
                .endYear(e.getEndYear())
                .createdAt(e.getCreatedAt() != null ? e.getCreatedAt().toString() : null)
                .build();
    }
}
