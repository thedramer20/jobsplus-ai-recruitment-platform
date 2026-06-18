package com.jobplus.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class NotificationResponseDTO {
    private Long    id;
    private String  type;
    private String  payload;
    private boolean readFlag;
    private String  createdAt;
}
