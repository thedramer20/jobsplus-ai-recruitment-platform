package com.jobplus.controller;

import com.jobplus.dto.request.UpdateUserDTO;
import com.jobplus.dto.response.ApiResponse;
import com.jobplus.dto.response.UserResponseDTO;
import com.jobplus.service.UserService;
import com.jobplus.util.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponseDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(userService.getById(id)));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponseDTO>> getMe() {
        return ResponseEntity.ok(ApiResponse.success(userService.getMe(SecurityUtil.getCurrentUserId())));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserResponseDTO>> updateMe(@RequestBody @Valid UpdateUserDTO dto) {
        return ResponseEntity.ok(ApiResponse.success(userService.update(SecurityUtil.getCurrentUserId(), dto)));
    }

    @PostMapping("/me/avatar")
    public ResponseEntity<ApiResponse<String>> uploadAvatar(
            @RequestParam("avatar") MultipartFile file) {
        String avatarUrl = userService.uploadAvatar(SecurityUtil.getCurrentUserId(), file);
        return ResponseEntity.ok(ApiResponse.success(avatarUrl, "Avatar updated"));
    }

    @PostMapping("/me/resume")
    public ResponseEntity<ApiResponse<String>> uploadResume(
            @RequestParam("resume") MultipartFile file) {
        String resumeUrl = userService.uploadResume(SecurityUtil.getCurrentUserId(), file);
        return ResponseEntity.ok(ApiResponse.success(resumeUrl, "Resume uploaded"));
    }
}
