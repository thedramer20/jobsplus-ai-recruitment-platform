package com.jobplus.dto.response;

import com.jobplus.model.Role;
import com.jobplus.model.User;
import com.jobplus.model.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDTO {
    private Long       id;
    private String     email;
    private String     name;
    private String     headline;
    private String     avatarUrl;
    private String     location;
    private Role       role;
    private UserStatus status;
    private String     createdAt;

    public static UserResponseDTO fromUser(User user) {
        return UserResponseDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .headline(user.getHeadline())
                .avatarUrl(user.getAvatarUrl())
                .location(user.getLocation())
                .role(user.getRole())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : null)
                .build();
    }
}
