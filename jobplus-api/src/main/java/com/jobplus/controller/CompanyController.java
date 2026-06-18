package com.jobplus.controller;

import com.jobplus.dto.request.CreateCompanyDTO;
import com.jobplus.dto.response.ApiResponse;
import com.jobplus.dto.response.CompanyResponseDTO;
import com.jobplus.dto.response.JobResponseDTO;
import com.jobplus.dto.response.PaginatedResponseDTO;
import com.jobplus.model.CompanyFilterParams;
import com.jobplus.service.CompanyService;
import com.jobplus.util.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;

    @GetMapping
    public ResponseEntity<ApiResponse<PaginatedResponseDTO<CompanyResponseDTO>>> getAll(
            @RequestParam(required = false) String industry,
            @RequestParam(required = false) String size,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Boolean verified,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int pageSize
    ) {
        CompanyFilterParams params = CompanyFilterParams.builder()
                .industry(industry).size(size).location(location)
                .verified(verified).page(page).pageSize(pageSize)
                .build();
        return ResponseEntity.ok(ApiResponse.success(companyService.getAll(params)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CompanyResponseDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(companyService.getById(id)));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<ApiResponse<CompanyResponseDTO>> getMyCompany() {
        return ResponseEntity.ok(ApiResponse.success(
                companyService.getMyCompany(SecurityUtil.getCurrentUserId())));
    }

    @PostMapping
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<ApiResponse<CompanyResponseDTO>> create(@RequestBody @Valid CreateCompanyDTO dto) {
        return ResponseEntity.status(201).body(
                ApiResponse.success(companyService.create(dto, SecurityUtil.getCurrentUserId()), "Company created"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<ApiResponse<CompanyResponseDTO>> update(
            @PathVariable Long id, @RequestBody @Valid CreateCompanyDTO dto) {
        return ResponseEntity.ok(ApiResponse.success(
                companyService.update(id, dto, SecurityUtil.getCurrentUserId())));
    }

    @GetMapping("/{id}/jobs")
    public ResponseEntity<ApiResponse<PaginatedResponseDTO<JobResponseDTO>>> getJobs(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                companyService.getJobs(id, page, size, currentUserIdOrNull())));
    }

    private Long currentUserIdOrNull() {
        try { return SecurityUtil.getCurrentUserId(); } catch (Exception e) { return null; }
    }
}
