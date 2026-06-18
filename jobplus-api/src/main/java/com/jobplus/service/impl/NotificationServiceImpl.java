package com.jobplus.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jobplus.dto.response.NotificationResponseDTO;
import com.jobplus.dto.response.PaginatedResponseDTO;
import com.jobplus.mapper.NotificationMapper;
import com.jobplus.model.Notification;
import com.jobplus.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationMapper notificationMapper;
    private final ObjectMapper       objectMapper;

    @Override
    public PaginatedResponseDTO<NotificationResponseDTO> getPaginated(
            Long userId, boolean unreadOnly, int page, int size) {
        int offset = page * size;
        List<Notification> list = notificationMapper.findByUserId(userId, unreadOnly, size, offset);
        int total = notificationMapper.countByUserId(userId, unreadOnly);
        List<NotificationResponseDTO> content = list.stream().map(this::toDTO).collect(Collectors.toList());
        int totalPages = size == 0 ? 0 : (int) Math.ceil((double) total / size);
        return PaginatedResponseDTO.<NotificationResponseDTO>builder()
                .content(content)
                .totalElements(total)
                .totalPages(totalPages)
                .currentPage(page)
                .pageSize(size)
                .build();
    }

    @Override
    public long countUnread(Long userId) {
        return notificationMapper.countUnread(userId);
    }

    @Override
    @Transactional
    public void create(Long userId, String type, Object payload) {
        String jsonString;
        try {
            jsonString = objectMapper.writeValueAsString(payload);
        } catch (Exception e) {
            log.error("Failed to serialize notification payload for user {}: {}", userId, e.getMessage());
            jsonString = "{}";
        }
        notificationMapper.insert(Notification.builder()
                .userId(userId)
                .type(type)
                .payload(jsonString)
                .build());
    }

    @Override
    @Transactional
    public void markRead(Long id, Long userId) {
        notificationMapper.markRead(id, userId);
    }

    @Override
    @Transactional
    public void markAllRead(Long userId) {
        notificationMapper.markAllRead(userId);
    }

    private NotificationResponseDTO toDTO(Notification n) {
        return NotificationResponseDTO.builder()
                .id(n.getId())
                .type(n.getType())
                .payload(n.getPayload())
                .readFlag(n.getReadFlag() != null && n.getReadFlag())
                .createdAt(n.getCreatedAt() != null ? n.getCreatedAt().toString() : null)
                .build();
    }
}
