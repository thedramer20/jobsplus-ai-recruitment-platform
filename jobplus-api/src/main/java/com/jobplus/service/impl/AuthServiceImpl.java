package com.jobplus.service.impl;

import com.jobplus.dto.request.LoginRequestDTO;
import com.jobplus.dto.request.RefreshTokenRequestDTO;
import com.jobplus.dto.request.RegisterRequestDTO;
import com.jobplus.dto.response.AuthResponseDTO;
import com.jobplus.dto.response.UserResponseDTO;
import com.jobplus.exception.ConflictException;
import com.jobplus.exception.ForbiddenException;
import com.jobplus.exception.ResourceNotFoundException;
import com.jobplus.exception.ValidationException;
import com.jobplus.mapper.PasswordResetTokenMapper;
import com.jobplus.mapper.UserMapper;
import com.jobplus.model.PasswordResetToken;
import com.jobplus.model.User;
import com.jobplus.model.UserStatus;
import com.jobplus.security.JwtUtil;
import com.jobplus.service.AuthService;
import com.jobplus.service.EmailService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.core.task.TaskExecutor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserMapper                userMapper;
    private final PasswordResetTokenMapper  passwordResetTokenMapper;
    private final BCryptPasswordEncoder     passwordEncoder;
    private final JwtUtil                   jwtUtil;
    private final EmailService              emailService;
    private final TaskExecutor              taskExecutor;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    @Value("${auth.password-reset.expiry-minutes:30}")
    private long resetExpiryMinutes;

    @Value("${mail.enabled:false}")
    private boolean mailEnabled;

    @Override
    @Transactional
    public AuthResponseDTO register(RegisterRequestDTO request) {
        if (userMapper.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email already registered");
        }
        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .name(request.getName())
                .status(UserStatus.ACTIVE)
                .build();
        userMapper.insert(user);
        try {
            emailService.sendWelcome(user.getEmail(), user.getName());
        } catch (Exception e) {
            // welcome email failure must never block registration
        }
        return buildAuthResponse(user);
    }

    @Override
    public AuthResponseDTO login(LoginRequestDTO request) {
        User user = userMapper.findByEmail(request.getEmail());
        if (user == null) {
            throw new ResourceNotFoundException("User", "email", request.getEmail());
        }
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new ValidationException("Invalid email or password");
        }
        if (user.getStatus() == UserStatus.SUSPENDED) {
            throw new ForbiddenException("Account suspended");
        }
        return buildAuthResponse(user);
    }

    @Override
    public AuthResponseDTO refresh(RefreshTokenRequestDTO request) {
        Claims claims;
        try {
            claims = jwtUtil.validateRefreshToken(request.getRefreshToken());
        } catch (JwtException e) {
            throw new ValidationException("Invalid refresh token");
        }
        Long userId = jwtUtil.getUserIdFromToken(claims);
        User user = userMapper.findById(userId);
        if (user == null) {
            throw new ResourceNotFoundException("User", "id", userId);
        }
        String newAccessToken = jwtUtil.generateAccessToken(userId, user.getEmail(), user.getRole().name());
        return AuthResponseDTO.builder()
                .accessToken(newAccessToken)
                .refreshToken(request.getRefreshToken())
                .user(UserResponseDTO.fromUser(user))
                .build();
    }

    @Override
    public void logout(String accessToken) {
        // TODO: blacklist access token in Redis to prevent reuse before expiry.
    }

    @Override
    @Transactional
    public void changePassword(Long userId, String currentPassword, String newPassword) {
        User user = userMapper.findById(userId);
        if (user == null) throw new ResourceNotFoundException("User", "id", userId);
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash()))
            throw new ValidationException("Current password is incorrect");
        userMapper.updatePassword(userId, passwordEncoder.encode(newPassword));
    }

    @Override
    @Transactional
    public AuthResponseDTO changeEmail(Long userId, String currentPassword, String newEmail) {
        User user = userMapper.findById(userId);
        if (user == null) throw new ResourceNotFoundException("User", "id", userId);
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash()))
            throw new ValidationException("Current password is incorrect");

        String normalized = newEmail == null ? "" : newEmail.trim().toLowerCase();
        if (normalized.isEmpty() || !normalized.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$"))
            throw new ValidationException("Please provide a valid email address");
        if (normalized.equalsIgnoreCase(user.getEmail()))
            throw new ValidationException("That is already your email address");
        if (userMapper.existsByEmail(normalized))
            throw new ConflictException("Email already in use");

        userMapper.updateEmail(userId, normalized);
        // Re-issue tokens so the access token reflects the new email.
        return buildAuthResponse(userMapper.findById(userId));
    }

    @Override
    @Transactional
    public String requestPasswordReset(String email) {
        String normalized = email == null ? "" : email.trim().toLowerCase();
        User user = userMapper.findByEmail(normalized);
        // Never reveal whether the email exists — always return as if successful.
        if (user == null || user.getStatus() == UserStatus.SUSPENDED) {
            log.info("Password reset requested for non-existent/suspended email; ignoring");
            return null;
        }

        // Invalidate any outstanding tokens so only the newest link works.
        passwordResetTokenMapper.invalidateAllForUser(user.getId());

        String rawToken = generateToken();
        PasswordResetToken token = PasswordResetToken.builder()
                .userId(user.getId())
                .tokenHash(sha256Hex(rawToken))
                .expiresAt(LocalDateTime.now().plusMinutes(resetExpiryMinutes))
                .used(false)
                .build();
        passwordResetTokenMapper.insert(token);

        try {
            // In local/dev mail can be disabled, so we return the URL directly.
            if (!mailEnabled) {
                return emailService.sendPasswordReset(user.getEmail(), user.getName(), rawToken);
            }

            // In production-like setups, send mail in the background so slow SMTP does not
            // make the forgot-password page time out before the email is delivered.
            taskExecutor.execute(() -> {
                try {
                    emailService.sendPasswordReset(user.getEmail(), user.getName(), rawToken);
                } catch (Exception e) {
                    log.error("Failed to send password reset email to {}: {}", user.getEmail(), e.getMessage());
                }
            });
            return null;
        } catch (Exception e) {
            log.error("Failed to send password reset email to {}: {}", user.getEmail(), e.getMessage());
            return null;
        }
    }

    @Override
    @Transactional
    public void resetPassword(String token, String newPassword) {
        if (token == null || token.isBlank()) {
            throw new ValidationException("Invalid or expired reset link");
        }
        PasswordResetToken record = passwordResetTokenMapper.findByTokenHash(sha256Hex(token));
        if (record == null || record.isUsed() || record.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ValidationException("This reset link is invalid or has expired");
        }
        if (newPassword == null || newPassword.length() < 8) {
            throw new ValidationException("Password must be at least 8 characters");
        }

        userMapper.updatePassword(record.getUserId(), passwordEncoder.encode(newPassword));
        passwordResetTokenMapper.markUsed(record.getId());
        // Belt-and-suspenders: invalidate any other outstanding tokens for this user.
        passwordResetTokenMapper.invalidateAllForUser(record.getUserId());
    }

    private static String generateToken() {
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private static String sha256Hex(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }

    private AuthResponseDTO buildAuthResponse(User user) {
        String access  = jwtUtil.generateAccessToken(user.getId(), user.getEmail(), user.getRole().name());
        String refresh = jwtUtil.generateRefreshToken(user.getId());
        return AuthResponseDTO.builder()
                .accessToken(access)
                .refreshToken(refresh)
                .user(UserResponseDTO.fromUser(user))
                .build();
    }
}
