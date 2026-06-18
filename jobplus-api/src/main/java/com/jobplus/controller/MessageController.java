package com.jobplus.controller;

import com.jobplus.dto.response.ApiResponse;
import com.jobplus.dto.response.ConversationResponseDTO;
import com.jobplus.dto.response.MessageResponseDTO;
import com.jobplus.service.MessageService;
import com.jobplus.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @GetMapping("/api/conversations")
    public ResponseEntity<ApiResponse<List<ConversationResponseDTO>>> getConversations() {
        return ResponseEntity.ok(ApiResponse.success(
                messageService.getMyConversations(SecurityUtil.getCurrentUserId())));
    }

    @PostMapping("/api/conversations")
    public ResponseEntity<ApiResponse<ConversationResponseDTO>> startConversation(
            @RequestBody Map<String, Long> body) {
        return ResponseEntity.status(201).body(ApiResponse.success(
                messageService.startConversation(SecurityUtil.getCurrentUserId(), body.get("otherUserId")),
                "Conversation started"));
    }

    @GetMapping("/api/conversations/{id}/messages")
    public ResponseEntity<ApiResponse<List<MessageResponseDTO>>> getMessages(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                messageService.getMessages(id, SecurityUtil.getCurrentUserId(), page, size)));
    }

    @PostMapping("/api/conversations/{id}/messages")
    public ResponseEntity<ApiResponse<MessageResponseDTO>> sendMessage(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.status(201).body(ApiResponse.success(
                messageService.sendMessage(id, SecurityUtil.getCurrentUserId(), body.get("content")),
                "Message sent"));
    }
}
