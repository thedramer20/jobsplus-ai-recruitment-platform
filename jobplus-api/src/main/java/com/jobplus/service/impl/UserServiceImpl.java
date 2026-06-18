package com.jobplus.service.impl;

import com.jobplus.dto.request.UpdateUserDTO;
import com.jobplus.dto.response.UserResponseDTO;
import com.jobplus.exception.ResourceNotFoundException;
import com.jobplus.exception.ValidationException;
import com.jobplus.mapper.SeekerProfileMapper;
import com.jobplus.mapper.UserMapper;
import com.jobplus.model.SeekerProfile;
import com.jobplus.model.User;
import com.jobplus.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of("image/jpeg", "image/png");
    private static final Set<String> ALLOWED_RESUME_TYPES = Set.of(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    private static final long MAX_IMAGE_BYTES  = 2 * 1024 * 1024L;
    private static final long MAX_RESUME_BYTES = 5 * 1024 * 1024L;

    @Value("${upload.path}")
    private String uploadPath;

    @Value("${upload.base-url}")
    private String uploadBaseUrl;

    private final UserMapper          userMapper;
    private final SeekerProfileMapper seekerProfileMapper;

    @Override
    public UserResponseDTO getById(Long id) {
        User user = userMapper.findById(id);
        if (user == null) throw new ResourceNotFoundException("User not found");
        return UserResponseDTO.fromUser(user);
    }

    @Override
    public UserResponseDTO getMe(Long currentUserId) {
        return getById(currentUserId);
    }

    @Override
    @Transactional
    public UserResponseDTO update(Long currentUserId, UpdateUserDTO dto) {
        User user = userMapper.findById(currentUserId);
        if (user == null) throw new ResourceNotFoundException("User not found");

        if (dto.getName() != null)      user.setName(dto.getName());
        if (dto.getHeadline() != null)  user.setHeadline(dto.getHeadline());
        if (dto.getAvatarUrl() != null) user.setAvatarUrl(dto.getAvatarUrl());
        if (dto.getLocation() != null)  user.setLocation(dto.getLocation());

        userMapper.updateById(user);
        return UserResponseDTO.fromUser(userMapper.findById(currentUserId));
    }

    @Override
    @Transactional
    public String uploadAvatar(Long userId, MultipartFile file) {
        if (file == null || file.isEmpty()) throw new ValidationException("No file provided");
        if (!ALLOWED_IMAGE_TYPES.contains(file.getContentType()))
            throw new ValidationException("Only JPEG and PNG images are allowed");
        if (file.getSize() > MAX_IMAGE_BYTES)
            throw new ValidationException("File exceeds the 2 MB limit");

        try {
            Path dir = Paths.get(uploadPath).toAbsolutePath();
            Files.createDirectories(dir);

            String imgExt = "image/png".equals(file.getContentType()) ? "png" : "jpg";
            String filename = "avatar_" + userId + "_" + System.currentTimeMillis() + "." + imgExt;
            Path dest = dir.resolve(filename);
            file.transferTo(dest.toFile());

            String avatarUrl = uploadBaseUrl.stripTrailing() + "/" + filename;
            userMapper.updateAvatarUrl(userId, avatarUrl);
            log.info("Avatar updated for user {}: {}", userId, avatarUrl);
            return avatarUrl;
        } catch (IOException e) {
            log.error("Avatar upload failed for user {}", userId, e);
            throw new RuntimeException("Failed to save avatar", e);
        }
    }

    @Override
    @Transactional
    public String uploadResume(Long userId, MultipartFile file) {
        if (file == null || file.isEmpty()) throw new ValidationException("No file provided");
        if (!ALLOWED_RESUME_TYPES.contains(file.getContentType()))
            throw new ValidationException("Only PDF and Word documents are allowed");
        if (file.getSize() > MAX_RESUME_BYTES)
            throw new ValidationException("File exceeds the 5 MB limit");

        try {
            Path dir = Paths.get(uploadPath).toAbsolutePath();
            Files.createDirectories(dir);

            String filename = "resume_" + userId + "_" + System.currentTimeMillis() + "." + resumeExtension(file.getContentType());
            Path dest = dir.resolve(filename);
            file.transferTo(dest.toFile());

            String resumeUrl = uploadBaseUrl.stripTrailing() + "/" + filename;

            // Persist the resume URL on the seeker profile, creating the row if needed.
            if (seekerProfileMapper.findByUserId(userId) == null) {
                seekerProfileMapper.insert(SeekerProfile.builder().userId(userId).build());
            }
            seekerProfileMapper.updateByUserId(
                    SeekerProfile.builder().userId(userId).resumeUrl(resumeUrl).build());

            log.info("Resume uploaded for user {}: {}", userId, resumeUrl);
            return resumeUrl;
        } catch (IOException e) {
            log.error("Resume upload failed for user {}", userId, e);
            throw new RuntimeException("Failed to save resume", e);
        }
    }

    private static String resumeExtension(String contentType) {
        if (contentType == null) return "pdf";
        return switch (contentType) {
            case "application/msword" -> "doc";
            case "application/vnd.openxmlformats-officedocument.wordprocessingml.document" -> "docx";
            default -> "pdf";
        };
    }
}
