package com.jobplus.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponseDTO {
    private String          accessToken;
    private String          refreshToken;
    @Builder.Default
    private String          tokenType = "Bearer";
    private UserResponseDTO user;
}
