package com.jobplus.service;

import java.util.Map;

public interface SettingsService {
    Map<String, Object> getSettings(Long userId);
    Map<String, Object> saveSettings(Long userId, Map<String, Object> settings);
}
