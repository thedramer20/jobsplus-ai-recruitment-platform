package com.jobplus.service;

import com.jobplus.dto.response.ConnectionResponseDTO;
import com.jobplus.exception.ConflictException;
import com.jobplus.exception.ForbiddenException;
import com.jobplus.exception.ResourceNotFoundException;
import com.jobplus.mapper.ConnectionMapper;
import com.jobplus.mapper.UserMapper;
import com.jobplus.model.Connection;
import com.jobplus.model.User;
import com.jobplus.service.impl.ConnectionServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ConnectionServiceTest {

    @Mock ConnectionMapper    connectionMapper;
    @Mock UserMapper          userMapper;
    @Mock NotificationService notificationService;

    @InjectMocks ConnectionServiceImpl connectionService;

    private static final Long REQUESTER_ID = 1L;
    private static final Long ADDRESSEE_ID = 2L;
    private static final Long CONNECTION_ID = 10L;

    private User requesterUser;
    private User addresseeUser;
    private Connection pendingConnection;

    @BeforeEach
    void setUp() {
        requesterUser = User.builder().id(REQUESTER_ID).name("Alice").email("alice@example.com").build();
        addresseeUser = User.builder().id(ADDRESSEE_ID).name("Bob").email("bob@example.com").build();

        pendingConnection = Connection.builder()
                .id(CONNECTION_ID)
                .requesterId(REQUESTER_ID)
                .addresseeId(ADDRESSEE_ID)
                .status("PENDING")
                .build();
    }

    // ── sendRequest() ─────────────────────────────────────────────────────────

    @Test
    void sendRequest_happyPath_insertsConnectionAndCreatesNotification() {
        // No existing connection in either direction
        when(connectionMapper.findByUsers(REQUESTER_ID, ADDRESSEE_ID)).thenReturn(null);
        when(connectionMapper.findByUsers(ADDRESSEE_ID, REQUESTER_ID)).thenReturn(null);
        // After insert (id is set via MyBatis useGeneratedKeys), findById returns saved record
        when(connectionMapper.findById(any())).thenReturn(pendingConnection);
        when(userMapper.findById(REQUESTER_ID)).thenReturn(requesterUser);
        // toDTO looks up the "other" user (addressee, since current=requester)
        when(userMapper.findById(ADDRESSEE_ID)).thenReturn(addresseeUser);

        ConnectionResponseDTO result = connectionService.sendRequest(REQUESTER_ID, ADDRESSEE_ID);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(CONNECTION_ID);
        verify(connectionMapper, times(1)).insert(any(Connection.class));
        verify(notificationService, times(1)).create(
                eq(ADDRESSEE_ID), eq("CONNECTION_REQUEST"), any());
    }

    @Test
    void sendRequest_selfConnect_throwsValidationException() {
        assertThatThrownBy(() -> connectionService.sendRequest(REQUESTER_ID, REQUESTER_ID))
                .isInstanceOf(com.jobplus.exception.ValidationException.class);

        verify(connectionMapper, never()).insert(any());
    }

    @Test
    void sendRequest_existingConnectionRequesterToAddressee_throwsConflictException() {
        when(connectionMapper.findByUsers(REQUESTER_ID, ADDRESSEE_ID)).thenReturn(pendingConnection);

        assertThatThrownBy(() -> connectionService.sendRequest(REQUESTER_ID, ADDRESSEE_ID))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("Already connected");

        verify(connectionMapper, never()).insert(any());
    }

    @Test
    void sendRequest_existingConnectionAddresseeToRequester_throwsConflictException() {
        // reverse direction also blocks new request
        when(connectionMapper.findByUsers(REQUESTER_ID, ADDRESSEE_ID)).thenReturn(null);
        when(connectionMapper.findByUsers(ADDRESSEE_ID, REQUESTER_ID)).thenReturn(pendingConnection);

        assertThatThrownBy(() -> connectionService.sendRequest(REQUESTER_ID, ADDRESSEE_ID))
                .isInstanceOf(ConflictException.class);

        verify(connectionMapper, never()).insert(any());
    }

    // ── accept() ─────────────────────────────────────────────────────────────

    @Test
    void accept_happyPath_updatesStatusToAcceptedAndNotifiesRequester() {
        when(connectionMapper.findById(CONNECTION_ID)).thenReturn(pendingConnection);
        Connection acceptedConn = Connection.builder()
                .id(CONNECTION_ID)
                .requesterId(REQUESTER_ID)
                .addresseeId(ADDRESSEE_ID)
                .status("ACCEPTED")
                .build();
        // First call → pending, second call (after update) → accepted
        when(connectionMapper.findById(CONNECTION_ID))
                .thenReturn(pendingConnection)
                .thenReturn(acceptedConn);
        when(userMapper.findById(ADDRESSEE_ID)).thenReturn(addresseeUser);
        // toDTO call looks up the other user (requester, since current=addressee)
        when(userMapper.findById(REQUESTER_ID)).thenReturn(requesterUser);

        ConnectionResponseDTO result = connectionService.accept(CONNECTION_ID, ADDRESSEE_ID);

        assertThat(result).isNotNull();
        verify(connectionMapper, times(1)).updateStatus(CONNECTION_ID, "ACCEPTED", ADDRESSEE_ID);
        verify(notificationService, times(1)).create(
                eq(REQUESTER_ID), eq("CONNECTION_ACCEPTED"), any());
    }

    @Test
    void accept_connectionNotFound_throwsResourceNotFoundException() {
        when(connectionMapper.findById(CONNECTION_ID)).thenReturn(null);

        assertThatThrownBy(() -> connectionService.accept(CONNECTION_ID, ADDRESSEE_ID))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void accept_callerIsNotAddressee_throwsForbiddenException() {
        Long wrongUser = 999L;
        when(connectionMapper.findById(CONNECTION_ID)).thenReturn(pendingConnection);

        assertThatThrownBy(() -> connectionService.accept(CONNECTION_ID, wrongUser))
                .isInstanceOf(ForbiddenException.class);

        verify(connectionMapper, never()).updateStatus(anyLong(), anyString(), anyLong());
    }

    // ── reject() ─────────────────────────────────────────────────────────────

    @Test
    void reject_happyPath_updatesStatusToRejected() {
        when(connectionMapper.findById(CONNECTION_ID)).thenReturn(pendingConnection);

        connectionService.reject(CONNECTION_ID, ADDRESSEE_ID);

        verify(connectionMapper, times(1)).updateStatus(CONNECTION_ID, "REJECTED", ADDRESSEE_ID);
    }

    @Test
    void reject_callerIsNotAddressee_throwsForbiddenException() {
        Long wrongUser = 999L;
        when(connectionMapper.findById(CONNECTION_ID)).thenReturn(pendingConnection);

        assertThatThrownBy(() -> connectionService.reject(CONNECTION_ID, wrongUser))
                .isInstanceOf(ForbiddenException.class);
    }

    // ── getMyConnections() ────────────────────────────────────────────────────

    @Test
    void getMyConnections_returnsListMappedToDTO() {
        Connection accepted = Connection.builder()
                .id(20L)
                .requesterId(REQUESTER_ID)
                .addresseeId(ADDRESSEE_ID)
                .status("ACCEPTED")
                .build();

        when(connectionMapper.findAcceptedByUserId(REQUESTER_ID)).thenReturn(List.of(accepted));
        when(userMapper.findById(ADDRESSEE_ID)).thenReturn(addresseeUser);

        List<ConnectionResponseDTO> result = connectionService.getMyConnections(REQUESTER_ID);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(20L);
    }
}
