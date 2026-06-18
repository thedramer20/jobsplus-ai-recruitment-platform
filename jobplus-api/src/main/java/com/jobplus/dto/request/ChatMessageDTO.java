package com.jobplus.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class ChatMessageDTO {
    @NotBlank
    private String message;
    private List<ChatTurnDTO> conversationHistory;
}
