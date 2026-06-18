package com.jobplus.model;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    private Long          id;
    private Long          userId;
    private String        type;
    private String        payload;
    private Boolean       readFlag;
    private LocalDateTime createdAt;
}
