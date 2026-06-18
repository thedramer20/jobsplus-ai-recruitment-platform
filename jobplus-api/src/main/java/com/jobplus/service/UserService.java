package com.jobplus.service;

import com.jobplus.dto.request.UpdateUserDTO;
import com.jobplus.dto.response.UserResponseDTO;
import org.springframework.web.multipart.MultipartFile;

public interface UserService {
    UserResponseDTO getById(Long id);
    UserResponseDTO getMe(Long currentUserId);
    UserResponseDTO update(Long currentUserId, UpdateUserDTO dto);
    String uploadAvatar(Long userId, MultipartFile file);
    String uploadResume(Long userId, MultipartFile file);
}
