package com.jobplus.mapper;

import com.jobplus.model.Message;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface MessageMapper {
    List<Message> findByConversationId(@Param("conversationId") Long conversationId,
                                       @Param("limit") int limit,
                                       @Param("offset") int offset);
    int insert(Message message);
    int markRead(@Param("conversationId") Long conversationId, @Param("userId") Long userId);
    int countUnread(@Param("conversationId") Long conversationId, @Param("userId") Long userId);
}
