package com.jobplus.service;

import com.jobplus.dto.response.NotificationResponseDTO;
import com.jobplus.dto.response.PaginatedResponseDTO;

public interface NotificationService {
    PaginatedResponseDTO<NotificationResponseDTO> getPaginated(Long userId, boolean unreadOnly, int page, int size);
    long countUnread(Long userId);
    void create(Long userId, String type, Object payload);
    void markRead(Long id, Long userId);
    void markAllRead(Long userId);
}
