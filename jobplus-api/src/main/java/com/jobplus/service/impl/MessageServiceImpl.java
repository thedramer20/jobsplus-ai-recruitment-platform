package com.jobplus.service.impl;

import com.jobplus.dto.response.ConversationResponseDTO;
import com.jobplus.dto.response.MessageResponseDTO;
import com.jobplus.dto.response.UserResponseDTO;
import com.jobplus.exception.ForbiddenException;
import com.jobplus.mapper.ConversationMapper;
import com.jobplus.mapper.MessageMapper;
import com.jobplus.mapper.UserMapper;
import com.jobplus.model.Conversation;
import com.jobplus.model.Message;
import com.jobplus.model.User;
import com.jobplus.service.MessageService;
import com.jobplus.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {

    private final ConversationMapper conversationMapper;
    private final MessageMapper      messageMapper;
    private final UserMapper         userMapper;
    private final NotificationService notificationService;

    @Override
    public List<ConversationResponseDTO> getMyConversations(Long userId) {
        return conversationMapper.findByUserId(userId);
    }

    @Override
    @Transactional
    public ConversationResponseDTO startConversation(Long userId, Long otherUserId) {
        Conversation existing = conversationMapper.findByParticipants(userId, otherUserId);
        if (existing != null) {
            List<ConversationResponseDTO> all = conversationMapper.findByUserId(userId);
            return all.stream()
                    .filter(c -> c.getId().equals(existing.getId()))
                    .findFirst()
                    .orElseGet(() -> buildSummaryDTO(existing, userId, otherUserId));
        }
        Conversation conv = Conversation.builder().build();
        conversationMapper.insert(conv);
        conversationMapper.insertParticipant(conv.getId(), userId);
        conversationMapper.insertParticipant(conv.getId(), otherUserId);
        return buildSummaryDTO(conv, userId, otherUserId);
    }

    @Override
    @Transactional
    public MessageResponseDTO sendMessage(Long conversationId, Long senderId, String content) {
        if (!conversationMapper.isParticipant(conversationId, senderId)) {
            throw new ForbiddenException("Not a participant of this conversation");
        }
        Message msg = Message.builder()
                .conversationId(conversationId)
                .senderId(senderId)
                .content(content)
                .build();
        messageMapper.insert(msg);
        conversationMapper.updateTimestamp(conversationId);

        Long recipientId = conversationMapper.findOtherParticipant(conversationId, senderId);
        if (recipientId != null) {
            int currentUnread = messageMapper.countUnread(conversationId, recipientId);
            if (currentUnread <= 1) {
                User sender = userMapper.findById(senderId);
                String senderName = sender != null ? sender.getName() : "Someone";
                notificationService.create(recipientId, "MESSAGE_RECEIVED",
                        Map.of("senderName", senderName));
            }
        }

        return toMsgDTO(msg);
    }

    @Override
    public List<MessageResponseDTO> getMessages(Long conversationId, Long userId, int page, int size) {
        if (!conversationMapper.isParticipant(conversationId, userId)) {
            throw new ForbiddenException("Not a participant of this conversation");
        }
        messageMapper.markRead(conversationId, userId);
        return messageMapper.findByConversationId(conversationId, size, page * size)
                .stream().map(this::toMsgDTO).collect(Collectors.toList());
    }

    private ConversationResponseDTO buildSummaryDTO(Conversation conv, Long userId, Long otherUserId) {
        User other = userMapper.findById(otherUserId);
        UserResponseDTO otherDto = other != null ? UserResponseDTO.fromUser(other) : null;
        return ConversationResponseDTO.builder()
                .id(conv.getId())
                .otherUser(otherDto)
                .lastMessageContent(null)
                .lastMessageAt(null)
                .unreadCount(0)
                .build();
    }

    private MessageResponseDTO toMsgDTO(Message m) {
        return MessageResponseDTO.builder()
                .id(m.getId())
                .conversationId(m.getConversationId())
                .senderId(m.getSenderId())
                .content(m.getContent())
                .readAt(m.getReadAt() != null ? m.getReadAt().toString() : null)
                .createdAt(m.getCreatedAt() != null ? m.getCreatedAt().toString() : null)
                .build();
    }
}
