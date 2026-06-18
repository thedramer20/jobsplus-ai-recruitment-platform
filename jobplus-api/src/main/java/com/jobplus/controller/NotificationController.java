package com.jobplus.controller;

import com.jobplus.dto.response.ApiResponse;
import com.jobplus.dto.response.NotificationResponseDTO;
import com.jobplus.dto.response.PaginatedResponseDTO;
import com.jobplus.service.NotificationService;
import com.jobplus.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<PaginatedResponseDTO<NotificationResponseDTO>>> list(
            @RequestParam(defaultValue = "false") boolean unreadOnly,
            @RequestParam(defaultValue = "0")     int page,
            @RequestParam(defaultValue = "20")    int size) {
        return ResponseEntity.ok(ApiResponse.success(
                notificationService.getPaginated(SecurityUtil.getCurrentUserId(), unreadOnly, page, size)));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> unreadCount() {
        long count = notificationService.countUnread(SecurityUtil.getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success(Map.of("count", count)));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markRead(@PathVariable Long id) {
        notificationService.markRead(id, SecurityUtil.getCurrentUserId());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllRead() {
        notificationService.markAllRead(SecurityUtil.getCurrentUserId());
        return ResponseEntity.noContent().build();
    }
}
