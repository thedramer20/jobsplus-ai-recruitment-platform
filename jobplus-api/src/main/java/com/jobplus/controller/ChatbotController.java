package com.jobplus.controller;

import com.jobplus.dto.request.ChatMessageDTO;
import com.jobplus.dto.response.ApiResponse;
import com.jobplus.dto.response.ChatReplyDTO;
import com.jobplus.service.ChatbotService;
import com.jobplus.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
public class ChatbotController {

    private final ChatbotService chatbotService;

    @PostMapping("/message")
    public ResponseEntity<ApiResponse<ChatReplyDTO>> chat(@RequestBody ChatMessageDTO dto) {
        Long userId = SecurityUtil.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(chatbotService.chat(dto, userId)));
    }
}
