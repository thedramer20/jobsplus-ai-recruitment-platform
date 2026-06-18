package com.jobplus.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationResponseDTO {
    private Long            id;
    private UserResponseDTO otherUser;
    private String          lastMessageContent;
    private String          lastMessageAt;
    private int             unreadCount;
}
