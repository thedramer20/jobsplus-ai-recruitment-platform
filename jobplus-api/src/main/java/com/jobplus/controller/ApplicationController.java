package com.jobplus.controller;

import com.jobplus.dto.request.ApplyJobDTO;
import com.jobplus.dto.response.ApiResponse;
import com.jobplus.dto.response.ApplicationResponseDTO;
import com.jobplus.dto.response.PaginatedResponseDTO;
import com.jobplus.service.ApplicationService;
import com.jobplus.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    @PostMapping("/api/jobs/{jobId}/apply")
    @PreAuthorize("hasRole('JOB_SEEKER')")
    public ResponseEntity<ApiResponse<ApplicationResponseDTO>> apply(
            @PathVariable Long jobId,
            @RequestBody ApplyJobDTO dto) {
        return ResponseEntity.status(201).body(
                ApiResponse.success(applicationService.apply(jobId, SecurityUtil.getCurrentUserId(), dto),
                        "Application submitted"));
    }

    @GetMapping("/api/applications/me")
    public ResponseEntity<ApiResponse<PaginatedResponseDTO<ApplicationResponseDTO>>> getMyApplications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                applicationService.getMyApplications(SecurityUtil.getCurrentUserId(), page, size)));
    }

    @GetMapping("/api/jobs/{jobId}/applicants")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<ApiResponse<PaginatedResponseDTO<ApplicationResponseDTO>>> getApplicants(
            @PathVariable Long jobId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                applicationService.getJobApplicants(jobId, SecurityUtil.getCurrentUserId(), page, size)));
    }

    @PatchMapping("/api/applications/{id}/status")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<ApiResponse<ApplicationResponseDTO>> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.success(
                applicationService.updateStatus(id, body.get("status"), SecurityUtil.getCurrentUserId())));
    }
}
