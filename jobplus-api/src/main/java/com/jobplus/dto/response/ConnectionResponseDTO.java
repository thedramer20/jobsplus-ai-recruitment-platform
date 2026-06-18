package com.jobplus.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ConnectionResponseDTO {
    private Long            id;
    private UserResponseDTO otherUser;
    private String          status;
    private String          createdAt;
}
