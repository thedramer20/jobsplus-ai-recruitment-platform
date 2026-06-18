package com.jobplus.mapper;

import com.jobplus.dto.response.ConversationResponseDTO;
import com.jobplus.model.Conversation;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ConversationMapper {
    List<ConversationResponseDTO> findByUserId(@Param("userId") Long userId);
    Conversation findById(Long id);
    boolean isParticipant(@Param("conversationId") Long conversationId, @Param("userId") Long userId);
    int insert(Conversation conversation);
    int updateTimestamp(Long id);
    Conversation findByParticipants(@Param("userId1") Long userId1, @Param("userId2") Long userId2);
    int insertParticipant(@Param("conversationId") Long conversationId, @Param("userId") Long userId);
    Long findOtherParticipant(@Param("conversationId") Long conversationId, @Param("userId") Long userId);
}
