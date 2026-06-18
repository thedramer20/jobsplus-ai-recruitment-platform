package com.jobplus.mapper;

import com.jobplus.model.Notification;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface NotificationMapper {
    int insert(Notification notification);
    List<Notification> findByUserId(@Param("userId") Long userId,
                                    @Param("unreadOnly") boolean unreadOnly,
                                    @Param("limit") int limit,
                                    @Param("offset") int offset);
    int countUnread(Long userId);
    int markRead(@Param("id") Long id, @Param("userId") Long userId);
    int markAllRead(Long userId);
    int countByUserId(@Param("userId") Long userId, @Param("unreadOnly") boolean unreadOnly);
}
