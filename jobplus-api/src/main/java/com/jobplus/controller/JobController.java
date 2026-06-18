package com.jobplus.controller;

import com.jobplus.dto.request.CreateJobDTO;
import com.jobplus.dto.request.UpdateJobDTO;
import com.jobplus.dto.response.ApiResponse;
import com.jobplus.dto.response.JobResponseDTO;
import com.jobplus.dto.response.PaginatedResponseDTO;
import com.jobplus.model.JobFilterParams;
import com.jobplus.service.JobService;
import com.jobplus.util.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;

    @GetMapping
    public ResponseEntity<ApiResponse<PaginatedResponseDTO<JobResponseDTO>>> getJobs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String employmentType,
            @RequestParam(required = false) String experienceLevel,
            @RequestParam(required = false) BigDecimal salaryMin,
            @RequestParam(required = false) BigDecimal salaryMax,
            @RequestParam(required = false) Boolean remote,
            @RequestParam(required = false) Long companyId,
            @RequestParam(required = false) Integer postedWithinDays,
            @RequestParam(required = false) List<Long> skillIds,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        JobFilterParams params = JobFilterParams.builder()
                .keyword(keyword).location(location)
                .employmentType(employmentType).experienceLevel(experienceLevel)
                .salaryMin(salaryMin).salaryMax(salaryMax)
                .remote(remote).companyId(companyId)
                .postedWithinDays(postedWithinDays).skillIds(skillIds)
                .page(page).size(size)
                .build();
        return ResponseEntity.ok(ApiResponse.success(jobService.getJobs(params, currentUserIdOrNull())));
    }

    @GetMapping("/saved")
    public ResponseEntity<ApiResponse<PaginatedResponseDTO<JobResponseDTO>>> getSaved(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                jobService.getSaved(SecurityUtil.getCurrentUserId(), page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<JobResponseDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(jobService.getById(id, currentUserIdOrNull())));
    }

    @PostMapping
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<ApiResponse<JobResponseDTO>> create(@RequestBody @Valid CreateJobDTO dto) {
        return ResponseEntity.status(201).body(
                ApiResponse.success(jobService.create(dto, SecurityUtil.getCurrentUserId()), "Job created"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<ApiResponse<JobResponseDTO>> update(
            @PathVariable Long id, @RequestBody UpdateJobDTO dto) {
        return ResponseEntity.ok(ApiResponse.success(
                jobService.update(id, dto, SecurityUtil.getCurrentUserId())));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        jobService.delete(id, SecurityUtil.getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success(null, "Job deleted"));
    }

    @PostMapping("/{id}/save")
    public ResponseEntity<ApiResponse<Void>> saveJob(@PathVariable Long id) {
        jobService.save(id, SecurityUtil.getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success(null, "Job saved"));
    }

    @DeleteMapping("/{id}/save")
    public ResponseEntity<ApiResponse<Void>> unsaveJob(@PathVariable Long id) {
        jobService.unsave(id, SecurityUtil.getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success(null, "Job unsaved"));
    }

    private Long currentUserIdOrNull() {
        try { return SecurityUtil.getCurrentUserId(); } catch (Exception e) { return null; }
    }
}
