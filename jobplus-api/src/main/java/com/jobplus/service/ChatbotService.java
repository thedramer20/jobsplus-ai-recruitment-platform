package com.jobplus.service;

import com.jobplus.dto.request.ChatMessageDTO;
import com.jobplus.dto.response.ChatReplyDTO;

public interface ChatbotService {
    ChatReplyDTO chat(ChatMessageDTO dto, Long userId);
}
