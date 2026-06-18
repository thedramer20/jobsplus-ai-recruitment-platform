package com.jobplus.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {
    private Long          id;
    private String        email;
    private String        passwordHash;
    private Role          role;
    private String        name;
    private String        headline;
    private String        avatarUrl;
    private String        location;
    private UserStatus    status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
