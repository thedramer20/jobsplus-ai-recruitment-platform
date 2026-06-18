package com.jobplus.service;

import com.jobplus.dto.response.ConversationResponseDTO;
import com.jobplus.dto.response.MessageResponseDTO;

import java.util.List;

public interface MessageService {
    List<ConversationResponseDTO> getMyConversations(Long userId);
    ConversationResponseDTO startConversation(Long userId, Long otherUserId);
    MessageResponseDTO sendMessage(Long conversationId, Long senderId, String content);
    List<MessageResponseDTO> getMessages(Long conversationId, Long userId, int page, int size);
}
