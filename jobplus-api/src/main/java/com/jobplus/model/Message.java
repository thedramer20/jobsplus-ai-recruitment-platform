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
public class Message {
    private Long          id;
    private Long          conversationId;
    private Long          senderId;
    private String        content;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;
}
