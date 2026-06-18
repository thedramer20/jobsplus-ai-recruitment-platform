package com.jobplus.controller;

import com.jobplus.dto.response.ApiResponse;
import com.jobplus.service.SettingsService;
import com.jobplus.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class SettingsController {

    private final SettingsService settingsService;

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSettings() {
        return ResponseEntity.ok(ApiResponse.success(
                settingsService.getSettings(SecurityUtil.getCurrentUserId())));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> saveSettings(
            @RequestBody Map<String, Object> settings) {
        return ResponseEntity.ok(ApiResponse.success(
                settingsService.saveSettings(SecurityUtil.getCurrentUserId(), settings),
                "Settings saved"));
    }
}
