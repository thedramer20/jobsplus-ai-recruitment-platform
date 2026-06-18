package com.jobplus.mapper;

import com.jobplus.model.UserSettings;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface SettingsMapper {
    UserSettings findByUserId(Long userId);
    int upsert(UserSettings settings);
}
