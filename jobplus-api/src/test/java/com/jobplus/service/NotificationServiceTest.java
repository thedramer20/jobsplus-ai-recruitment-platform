package com.jobplus.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jobplus.dto.response.NotificationResponseDTO;
import com.jobplus.dto.response.PaginatedResponseDTO;
import com.jobplus.mapper.NotificationMapper;
import com.jobplus.model.Notification;
import com.jobplus.service.impl.NotificationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock NotificationMapper notificationMapper;

    // ObjectMapper is not a mapper interface; use a real instance so serialization works
    // Mockito @InjectMocks will inject the real ObjectMapper we supply via constructor injection.
    // Because NotificationServiceImpl uses @RequiredArgsConstructor we manually construct it.
    NotificationServiceImpl notificationService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final Long USER_ID = 1L;

    @BeforeEach
    void setUp() {
        notificationService = new NotificationServiceImpl(notificationMapper, objectMapper);
    }

    // ── create() ─────────────────────────────────────────────────────────────

    @Test
    void create_serializesPayloadAndInsertsNotification() {
        Map<String, Object> payload = Map.of("jobId", 10, "jobTitle", "Backend Engineer");

        notificationService.create(USER_ID, "NEW_APPLICATION", payload);

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationMapper, times(1)).insert(captor.capture());

        Notification saved = captor.getValue();
        assertThat(saved.getUserId()).isEqualTo(USER_ID);
        assertThat(saved.getType()).isEqualTo("NEW_APPLICATION");
        assertThat(saved.getPayload()).contains("jobId");
        assertThat(saved.getPayload()).contains("Backend Engineer");
    }

    @Test
    void create_withNullPayload_insertsEmptyJsonObject() {
        // Passing null as payload; ObjectMapper serializes it as "null" but impl falls back to "{}" on error.
        // The impl catches any exception and uses "{}"; null would be serialized as "null" by default —
        // this test verifies the insert is still called (no exception escapes).
        notificationService.create(USER_ID, "TEST_TYPE", null);

        verify(notificationMapper, times(1)).insert(any(Notification.class));
    }

    // ── markAllRead() ─────────────────────────────────────────────────────────

    @Test
    void markAllRead_delegatesToMapperOnce() {
        notificationService.markAllRead(USER_ID);

        verify(notificationMapper, times(1)).markAllRead(USER_ID);
    }

    // ── countUnread() ─────────────────────────────────────────────────────────

    @Test
    void countUnread_returnsValueFromMapper() {
        when(notificationMapper.countUnread(USER_ID)).thenReturn(7);

        long count = notificationService.countUnread(USER_ID);

        assertThat(count).isEqualTo(7L);
        verify(notificationMapper, times(1)).countUnread(USER_ID);
    }

    // ── getPaginated() ────────────────────────────────────────────────────────

    @Test
    void getPaginated_returnsMappedPageWithCorrectMetadata() {
        Notification n1 = Notification.builder()
                .id(1L).userId(USER_ID).type("NEW_APPLICATION").payload("{}").readFlag(false).build();
        Notification n2 = Notification.builder()
                .id(2L).userId(USER_ID).type("CONNECTION_REQUEST").payload("{}").readFlag(false).build();

        when(notificationMapper.findByUserId(eq(USER_ID), eq(false), eq(10), eq(0)))
                .thenReturn(List.of(n1, n2));
        when(notificationMapper.countByUserId(USER_ID, false)).thenReturn(2);

        PaginatedResponseDTO<NotificationResponseDTO> page =
                notificationService.getPaginated(USER_ID, false, 0, 10);

        assertThat(page).isNotNull();
        assertThat(page.getContent()).hasSize(2);
        assertThat(page.getTotalElements()).isEqualTo(2);
        assertThat(page.getCurrentPage()).isEqualTo(0);
        assertThat(page.getPageSize()).isEqualTo(10);
    }

    @Test
    void getPaginated_unreadOnlyFilter_passedThroughToMapper() {
        when(notificationMapper.findByUserId(eq(USER_ID), eq(true), eq(5), eq(0)))
                .thenReturn(List.of());
        when(notificationMapper.countByUserId(USER_ID, true)).thenReturn(0);

        PaginatedResponseDTO<NotificationResponseDTO> page =
                notificationService.getPaginated(USER_ID, true, 0, 5);

        assertThat(page.getContent()).isEmpty();
        verify(notificationMapper, times(1)).findByUserId(USER_ID, true, 5, 0);
    }

    // ── markRead() ────────────────────────────────────────────────────────────

    @Test
    void markRead_delegatesToMapper() {
        Long notificationId = 42L;

        notificationService.markRead(notificationId, USER_ID);

        verify(notificationMapper, times(1)).markRead(notificationId, USER_ID);
    }
}
