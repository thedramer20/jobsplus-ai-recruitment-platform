package com.jobplus.service.impl;

import com.jobplus.dto.response.ConnectionResponseDTO;
import com.jobplus.dto.response.UserResponseDTO;
import com.jobplus.exception.ConflictException;
import com.jobplus.exception.ForbiddenException;
import com.jobplus.exception.ResourceNotFoundException;
import com.jobplus.exception.ValidationException;
import com.jobplus.mapper.ConnectionMapper;
import com.jobplus.mapper.UserMapper;
import com.jobplus.model.Connection;
import com.jobplus.model.User;
import com.jobplus.service.ConnectionService;
import com.jobplus.service.EmailService;
import com.jobplus.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ConnectionServiceImpl implements ConnectionService {

    private final ConnectionMapper    connectionMapper;
    private final UserMapper          userMapper;
    private final NotificationService notificationService;
    private final EmailService        emailService;

    // ── helpers ───────────────────────────────────────────────────────────────

    private ConnectionResponseDTO toDTO(Connection conn, Long currentUserId) {
        Long otherUserId = conn.getRequesterId().equals(currentUserId)
                ? conn.getAddresseeId()
                : conn.getRequesterId();
        User other = userMapper.findById(otherUserId);
        UserResponseDTO otherDTO = other != null ? UserResponseDTO.fromUser(other) : null;
        return ConnectionResponseDTO.builder()
                .id(conn.getId())
                .otherUser(otherDTO)
                .status(conn.getStatus())
                .createdAt(conn.getCreatedAt() != null ? conn.getCreatedAt().toString() : null)
                .build();
    }

    // ── interface impl ────────────────────────────────────────────────────────

    @Override
    public List<ConnectionResponseDTO> getMyConnections(Long userId) {
        return connectionMapper.findAcceptedByUserId(userId)
                .stream()
                .map(c -> toDTO(c, userId))
                .collect(Collectors.toList());
    }

    @Override
    public List<ConnectionResponseDTO> getIncomingRequests(Long userId) {
        return connectionMapper.findPendingByAddresseeId(userId)
                .stream()
                .map(c -> toDTO(c, userId))
                .collect(Collectors.toList());
    }

    @Override
    public List<UserResponseDTO> getSuggestions(Long userId, int limit) {
        return connectionMapper.findSuggestions(userId, limit)
                .stream()
                .map(UserResponseDTO::fromUser)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ConnectionResponseDTO sendRequest(Long currentUserId, Long targetUserId) {
        if (currentUserId.equals(targetUserId)) {
            throw new ValidationException("Cannot connect with yourself");
        }
        if (connectionMapper.findByUsers(currentUserId, targetUserId) != null
                || connectionMapper.findByUsers(targetUserId, currentUserId) != null) {
            throw new ConflictException("Already connected or pending");
        }

        Connection conn = Connection.builder()
                .requesterId(currentUserId)
                .addresseeId(targetUserId)
                .build();
        connectionMapper.insert(conn);
        log.info("User {} sent connection request to {}", currentUserId, targetUserId);

        User requester = userMapper.findById(currentUserId);
        String requesterName = requester != null && requester.getName() != null
                ? requester.getName() : "Someone";
        notificationService.create(
                targetUserId,
                "CONNECTION_REQUEST",
                Map.of("requesterId", currentUserId, "requesterName", requesterName));
        try {
            User target = userMapper.findById(targetUserId);
            if (target != null && target.getEmail() != null) {
                emailService.sendConnectionRequest(target.getEmail(), target.getName(), requesterName);
            }
        } catch (Exception e) {
            log.warn("Email failed for connection request to {}: {}", targetUserId, e.getMessage());
        }

        return toDTO(connectionMapper.findById(conn.getId()), currentUserId);
    }

    @Override
    @Transactional
    public ConnectionResponseDTO accept(Long connectionId, Long currentUserId) {
        Connection conn = connectionMapper.findById(connectionId);
        if (conn == null) throw new ResourceNotFoundException("Connection not found: " + connectionId);
        if (!conn.getAddresseeId().equals(currentUserId)) {
            throw new ForbiddenException("Not the addressee of this connection request");
        }

        connectionMapper.updateStatus(connectionId, "ACCEPTED", currentUserId);
        log.info("User {} accepted connection {}", currentUserId, connectionId);

        User acceptor = userMapper.findById(currentUserId);
        String acceptorName = acceptor != null && acceptor.getName() != null
                ? acceptor.getName() : "Someone";
        notificationService.create(
                conn.getRequesterId(),
                "CONNECTION_ACCEPTED",
                Map.of("acceptorId", currentUserId, "acceptorName", acceptorName));
        try {
            User requester = userMapper.findById(conn.getRequesterId());
            if (requester != null && requester.getEmail() != null) {
                emailService.sendConnectionAccepted(requester.getEmail(), requester.getName(), acceptorName);
            }
        } catch (Exception e) {
            log.warn("Email failed for connection accept to {}: {}", conn.getRequesterId(), e.getMessage());
        }

        Connection updated = connectionMapper.findById(connectionId);
        return toDTO(updated, currentUserId);
    }

    @Override
    @Transactional
    public void reject(Long connectionId, Long currentUserId) {
        Connection conn = connectionMapper.findById(connectionId);
        if (conn == null) throw new ResourceNotFoundException("Connection not found: " + connectionId);
        if (!conn.getAddresseeId().equals(currentUserId)) {
            throw new ForbiddenException("Not the addressee of this connection request");
        }
        connectionMapper.updateStatus(connectionId, "REJECTED", currentUserId);
        log.info("User {} rejected connection {}", currentUserId, connectionId);
    }

    @Override
    @Transactional
    public void remove(Long connectionId, Long currentUserId) {
        Connection conn = connectionMapper.findById(connectionId);
        if (conn == null) throw new ResourceNotFoundException("Connection not found: " + connectionId);
        if (!conn.getRequesterId().equals(currentUserId) && !conn.getAddresseeId().equals(currentUserId)) {
            throw new ForbiddenException("Not a party to this connection");
        }
        connectionMapper.deleteById(connectionId, currentUserId);
        log.info("User {} removed connection {}", currentUserId, connectionId);
    }

    @Override
    @Transactional
    public void cancelRequest(Long currentUserId, Long targetUserId) {
        int rows = connectionMapper.deletePendingRequest(currentUserId, targetUserId);
        if (rows == 0) throw new ResourceNotFoundException("No pending request found");
        log.info("User {} cancelled connection request to {}", currentUserId, targetUserId);
    }

    @Override
    public String getConnectionStatus(Long currentUserId, Long targetUserId) {
        Connection sent = connectionMapper.findByUsers(currentUserId, targetUserId);
        if (sent != null) return sent.getStatus();
        Connection received = connectionMapper.findByUsers(targetUserId, currentUserId);
        if (received != null) {
            if ("PENDING".equals(received.getStatus())) return "PENDING_RECEIVED";
            return received.getStatus();
        }
        return "NONE";
    }
}
