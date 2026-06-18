package com.jobplus.service;

import com.jobplus.dto.response.ConnectionResponseDTO;
import com.jobplus.dto.response.UserResponseDTO;

import java.util.List;

public interface ConnectionService {
    List<ConnectionResponseDTO> getMyConnections(Long userId);
    List<ConnectionResponseDTO> getIncomingRequests(Long userId);
    List<UserResponseDTO> getSuggestions(Long userId, int limit);
    ConnectionResponseDTO sendRequest(Long currentUserId, Long targetUserId);
    ConnectionResponseDTO accept(Long connectionId, Long currentUserId);
    void reject(Long connectionId, Long currentUserId);
    void remove(Long connectionId, Long currentUserId);
    void cancelRequest(Long currentUserId, Long targetUserId);
    String getConnectionStatus(Long currentUserId, Long targetUserId);
}
