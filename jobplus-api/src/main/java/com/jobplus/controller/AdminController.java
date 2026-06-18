package com.jobplus.controller;

import com.jobplus.dto.response.AdminStatsDTO;
import com.jobplus.dto.response.ApiResponse;
import com.jobplus.dto.response.AuditLogDTO;
import com.jobplus.dto.response.CompanyResponseDTO;
import com.jobplus.dto.response.JobResponseDTO;
import com.jobplus.dto.response.PaginatedResponseDTO;
import com.jobplus.dto.response.PostResponseDTO;
import com.jobplus.dto.response.UserResponseDTO;
import com.jobplus.service.AdminService;
import com.jobplus.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    // ── Stats ─────────────────────────────────────────────────────────────────

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<AdminStatsDTO>> getStats() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getStats()));
    }

    // ── Users ─────────────────────────────────────────────────────────────────

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<PaginatedResponseDTO<UserResponseDTO>>> getUsers(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getUsers(role, status, search, page, size)));
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<ApiResponse<Void>> updateUserStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        adminService.updateUserStatus(id, body.get("status"), SecurityUtil.getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success(null, "User status updated"));
    }

    @PatchMapping("/users/{id}/role")
    public ResponseEntity<ApiResponse<Void>> updateUserRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        adminService.updateUserRole(id, body.get("role"), SecurityUtil.getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success(null, "User role updated"));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id, SecurityUtil.getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success(null, "User deleted"));
    }

    // ── Companies ─────────────────────────────────────────────────────────────

    @GetMapping("/companies")
    public ResponseEntity<ApiResponse<PaginatedResponseDTO<CompanyResponseDTO>>> getCompanies(
            @RequestParam(required = false) Boolean verified,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getCompanies(verified, search, page, size)));
    }

    @PatchMapping("/companies/{id}/verify")
    public ResponseEntity<ApiResponse<Void>> verifyCompany(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {
        adminService.setCompanyVerified(id, Boolean.TRUE.equals(body.get("verified")), SecurityUtil.getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success(null, "Company verification updated"));
    }

    // ── Jobs ──────────────────────────────────────────────────────────────────

    @GetMapping("/jobs")
    public ResponseEntity<ApiResponse<PaginatedResponseDTO<JobResponseDTO>>> getJobs(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getJobs(status, search, page, size)));
    }

    @PatchMapping("/jobs/{id}/status")
    public ResponseEntity<ApiResponse<Void>> updateJobStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        adminService.updateJobStatus(id, body.get("status"), SecurityUtil.getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success(null, "Job status updated"));
    }

    @DeleteMapping("/jobs/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteJob(@PathVariable Long id) {
        adminService.deleteJob(id, SecurityUtil.getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success(null, "Job deleted"));
    }

    // ── Posts ─────────────────────────────────────────────────────────────────

    @GetMapping("/posts")
    public ResponseEntity<ApiResponse<PaginatedResponseDTO<PostResponseDTO>>> getPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getPosts(page, size)));
    }

    @DeleteMapping("/posts/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePost(@PathVariable Long id) {
        adminService.deletePost(id, SecurityUtil.getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success(null, "Post deleted"));
    }

    // ── Audit Log ─────────────────────────────────────────────────────────────

    @GetMapping("/audit-log")
    public ResponseEntity<ApiResponse<PaginatedResponseDTO<AuditLogDTO>>> getAuditLog(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAuditLog(page, size)));
    }
}
