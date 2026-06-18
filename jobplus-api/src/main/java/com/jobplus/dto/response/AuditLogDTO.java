package com.jobplus.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuditLogDTO {
    private Long   id;
    private Long   adminId;
    private String adminName;
    private String action;
    private String targetType;
    private Long   targetId;
    private String detail;
    private String createdAt;
}
