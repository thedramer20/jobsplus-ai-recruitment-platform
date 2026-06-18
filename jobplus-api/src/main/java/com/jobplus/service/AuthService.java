package com.jobplus.service;

import com.jobplus.dto.request.LoginRequestDTO;
import com.jobplus.dto.request.RefreshTokenRequestDTO;
import com.jobplus.dto.request.RegisterRequestDTO;
import com.jobplus.dto.response.AuthResponseDTO;

public interface AuthService {
    AuthResponseDTO register(RegisterRequestDTO request);
    AuthResponseDTO login(LoginRequestDTO request);
    AuthResponseDTO refresh(RefreshTokenRequestDTO request);
    void logout(String accessToken);
    void changePassword(Long userId, String currentPassword, String newPassword);
    AuthResponseDTO changeEmail(Long userId, String currentPassword, String newEmail);
    /** Returns a dev-only reset URL when mail is disabled, otherwise null. */
    String requestPasswordReset(String email);
    void resetPassword(String token, String newPassword);
}
