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
public class Connection {
    private Long          id;
    private Long          requesterId;
    private Long          addresseeId;
    private String        status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
