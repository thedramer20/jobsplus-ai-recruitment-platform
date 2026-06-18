package com.jobplus.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jobplus.mapper.SettingsMapper;
import com.jobplus.model.UserSettings;
import com.jobplus.service.SettingsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class SettingsServiceImpl implements SettingsService {

    private static final TypeReference<Map<String, Object>> MAP_TYPE = new TypeReference<>() {};

    private final SettingsMapper settingsMapper;
    private final ObjectMapper   objectMapper;

    @Override
    public Map<String, Object> getSettings(Long userId) {
        UserSettings row = settingsMapper.findByUserId(userId);
        if (row == null || row.getSettingsJson() == null || row.getSettingsJson().isBlank()) {
            return Collections.emptyMap();
        }
        try {
            return objectMapper.readValue(row.getSettingsJson(), MAP_TYPE);
        } catch (Exception e) {
            log.warn("Corrupt settings JSON for user {}: {}", userId, e.getMessage());
            return Collections.emptyMap();
        }
    }

    @Override
    @Transactional
    public Map<String, Object> saveSettings(Long userId, Map<String, Object> settings) {
        Map<String, Object> safe = settings != null ? settings : Collections.emptyMap();
        try {
            String json = objectMapper.writeValueAsString(safe);
            settingsMapper.upsert(UserSettings.builder().userId(userId).settingsJson(json).build());
        } catch (Exception e) {
            log.error("Failed to serialize settings for user {}", userId, e);
            throw new RuntimeException("Failed to save settings", e);
        }
        return safe;
    }
}
