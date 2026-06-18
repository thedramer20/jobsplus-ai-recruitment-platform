package com.jobplus.controller;

import com.jobplus.dto.request.EducationRequestDTO;
import com.jobplus.dto.request.ExperienceRequestDTO;
import com.jobplus.dto.request.CreateSkillRequestDTO;
import com.jobplus.dto.request.UpdateProfileDTO;
import com.jobplus.dto.response.ApiResponse;
import com.jobplus.dto.response.EducationDTO;
import com.jobplus.dto.response.ExperienceDTO;
import com.jobplus.dto.response.ProfileResponseDTO;
import com.jobplus.dto.response.SkillDTO;
import com.jobplus.service.ProfileService;
import com.jobplus.util.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping("/profiles/{userId}")
    public ResponseEntity<ApiResponse<ProfileResponseDTO>> getProfile(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success(profileService.getById(userId)));
    }

    @PutMapping("/profiles/me")
    public ResponseEntity<ApiResponse<ProfileResponseDTO>> updateProfile(@RequestBody UpdateProfileDTO dto) {
        return ResponseEntity.ok(ApiResponse.success(
                profileService.updateProfile(SecurityUtil.getCurrentUserId(), dto)));
    }

    @PatchMapping("/profiles/me")
    public ResponseEntity<ApiResponse<Void>> patchProfile(@RequestBody UpdateProfileDTO dto) {
        if (dto.getBannerGradient() != null) {
            profileService.updateBannerGradient(SecurityUtil.getCurrentUserId(), dto.getBannerGradient());
        }
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/profiles/me/experience")
    public ResponseEntity<ApiResponse<ExperienceDTO>> addExperience(@RequestBody @Valid ExperienceRequestDTO dto) {
        return ResponseEntity.ok(ApiResponse.success(
                profileService.addExperience(SecurityUtil.getCurrentUserId(), dto)));
    }

    @PutMapping("/profiles/me/experience/{expId}")
    public ResponseEntity<ApiResponse<ExperienceDTO>> updateExperience(
            @PathVariable Long expId, @RequestBody @Valid ExperienceRequestDTO dto) {
        return ResponseEntity.ok(ApiResponse.success(
                profileService.updateExperience(SecurityUtil.getCurrentUserId(), expId, dto)));
    }

    @DeleteMapping("/profiles/me/experience/{expId}")
    public ResponseEntity<ApiResponse<Void>> deleteExperience(@PathVariable Long expId) {
        profileService.deleteExperience(SecurityUtil.getCurrentUserId(), expId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/profiles/me/education")
    public ResponseEntity<ApiResponse<EducationDTO>> addEducation(@RequestBody @Valid EducationRequestDTO dto) {
        return ResponseEntity.ok(ApiResponse.success(
                profileService.addEducation(SecurityUtil.getCurrentUserId(), dto)));
    }

    @PutMapping("/profiles/me/education/{eduId}")
    public ResponseEntity<ApiResponse<EducationDTO>> updateEducation(
            @PathVariable Long eduId, @RequestBody @Valid EducationRequestDTO dto) {
        return ResponseEntity.ok(ApiResponse.success(
                profileService.updateEducation(SecurityUtil.getCurrentUserId(), eduId, dto)));
    }

    @DeleteMapping("/profiles/me/education/{eduId}")
    public ResponseEntity<ApiResponse<Void>> deleteEducation(@PathVariable Long eduId) {
        profileService.deleteEducation(SecurityUtil.getCurrentUserId(), eduId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/skills")
    public ResponseEntity<ApiResponse<List<SkillDTO>>> getAllSkills() {
        return ResponseEntity.ok(ApiResponse.success(profileService.getAllSkills()));
    }

    @GetMapping("/profiles/me/skills")
    public ResponseEntity<ApiResponse<List<SkillDTO>>> getSkills() {
        return ResponseEntity.ok(ApiResponse.success(
                profileService.getSkills(SecurityUtil.getCurrentUserId())));
    }

    @PostMapping("/profiles/me/skills")
    public ResponseEntity<ApiResponse<SkillDTO>> createSkill(@RequestBody @Valid CreateSkillRequestDTO dto) {
        return ResponseEntity.ok(ApiResponse.success(
                profileService.createSkill(SecurityUtil.getCurrentUserId(), dto.getName())));
    }

    @PostMapping("/profiles/me/skills/{skillId}")
    public ResponseEntity<ApiResponse<Void>> addSkill(@PathVariable Long skillId) {
        profileService.addSkill(SecurityUtil.getCurrentUserId(), skillId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @DeleteMapping("/profiles/me/skills/{skillId}")
    public ResponseEntity<ApiResponse<Void>> removeSkill(@PathVariable Long skillId) {
        profileService.removeSkill(SecurityUtil.getCurrentUserId(), skillId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
