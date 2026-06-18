package com.jobplus.controller;

import com.jobplus.dto.response.ApiResponse;
import com.jobplus.dto.response.ConnectionResponseDTO;
import com.jobplus.dto.response.UserResponseDTO;
import com.jobplus.service.ConnectionService;
import com.jobplus.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/connections")
@RequiredArgsConstructor
public class ConnectionController {

    private final ConnectionService connectionService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ConnectionResponseDTO>>> getMyConnections() {
        return ResponseEntity.ok(ApiResponse.success(
                connectionService.getMyConnections(SecurityUtil.getCurrentUserId())));
    }

    @GetMapping("/requests")
    public ResponseEntity<ApiResponse<List<ConnectionResponseDTO>>> getIncomingRequests() {
        return ResponseEntity.ok(ApiResponse.success(
                connectionService.getIncomingRequests(SecurityUtil.getCurrentUserId())));
    }

    @GetMapping("/suggestions")
    public ResponseEntity<ApiResponse<List<UserResponseDTO>>> getSuggestions(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(ApiResponse.success(
                connectionService.getSuggestions(SecurityUtil.getCurrentUserId(), limit)));
    }

    @PostMapping("/request/{userId}")
    public ResponseEntity<ApiResponse<ConnectionResponseDTO>> sendRequest(
            @PathVariable Long userId) {
        return ResponseEntity.status(201).body(ApiResponse.success(
                connectionService.sendRequest(SecurityUtil.getCurrentUserId(), userId),
                "Connection request sent"));
    }

    @PatchMapping("/{id}/accept")
    public ResponseEntity<ApiResponse<ConnectionResponseDTO>> accept(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(
                connectionService.accept(id, SecurityUtil.getCurrentUserId()),
                "Connection accepted"));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<Void> reject(@PathVariable Long id) {
        connectionService.reject(id, SecurityUtil.getCurrentUserId());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remove(@PathVariable Long id) {
        connectionService.remove(id, SecurityUtil.getCurrentUserId());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/request/{userId}")
    public ResponseEntity<ApiResponse<Void>> cancelRequest(@PathVariable Long userId) {
        connectionService.cancelRequest(SecurityUtil.getCurrentUserId(), userId);
        return ResponseEntity.ok(ApiResponse.success(null, "Connection request cancelled"));
    }

    @GetMapping("/status/{userId}")
    public ResponseEntity<ApiResponse<String>> getStatus(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success(
                connectionService.getConnectionStatus(SecurityUtil.getCurrentUserId(), userId)));
    }
}
