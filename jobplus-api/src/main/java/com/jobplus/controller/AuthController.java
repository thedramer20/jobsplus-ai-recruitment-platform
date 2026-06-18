package com.jobplus.controller;

import com.jobplus.dto.request.ForgotPasswordRequestDTO;
import com.jobplus.dto.request.LoginRequestDTO;
import com.jobplus.dto.request.RefreshTokenRequestDTO;
import com.jobplus.dto.request.RegisterRequestDTO;
import com.jobplus.dto.request.ResetPasswordRequestDTO;
import com.jobplus.dto.response.ApiResponse;
import com.jobplus.dto.response.AuthResponseDTO;
import com.jobplus.service.AuthService;
import com.jobplus.util.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> register(
            @Valid @RequestBody RegisterRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(authService.register(request)));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> login(
            @Valid @RequestBody LoginRequestDTO request) {
        return ResponseEntity.ok(ApiResponse.success(authService.login(request)));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> refresh(
            @Valid @RequestBody RefreshTokenRequestDTO request) {
        return ResponseEntity.ok(ApiResponse.success(authService.refresh(request)));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7); // strip "Bearer "
        authService.logout(token);
        return ResponseEntity.ok(ApiResponse.success(null, "Logged out successfully"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequestDTO request) {
        // devResetUrl is non-null only in local/dev (mail disabled); null in production.
        String devResetUrl = authService.requestPasswordReset(request.getEmail());
        // Always 200 with a generic message — never reveal whether the email is registered.
        return ResponseEntity.ok(ApiResponse.success(devResetUrl,
                "If an account exists for that email, a reset link has been sent."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @Valid @RequestBody ResetPasswordRequestDTO request) {
        authService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok(ApiResponse.success(null, "Password has been reset. You can now sign in."));
    }

    @PatchMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(@RequestBody Map<String, String> body) {
        authService.changePassword(
                SecurityUtil.getCurrentUserId(),
                body.get("currentPassword"),
                body.get("newPassword"));
        return ResponseEntity.ok(ApiResponse.success(null, "Password changed"));
    }

    @PatchMapping("/change-email")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> changeEmail(@RequestBody Map<String, String> body) {
        AuthResponseDTO res = authService.changeEmail(
                SecurityUtil.getCurrentUserId(),
                body.get("currentPassword"),
                body.get("newEmail"));
        return ResponseEntity.ok(ApiResponse.success(res, "Email updated"));
    }
}
