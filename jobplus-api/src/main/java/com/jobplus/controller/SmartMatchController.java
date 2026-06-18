package com.jobplus.controller;

import com.jobplus.dto.response.ApiResponse;
import com.jobplus.dto.response.PaginatedResponseDTO;
import com.jobplus.dto.response.SmartMatchedCandidateDTO;
import com.jobplus.dto.response.SmartMatchedJobDTO;
import com.jobplus.dto.response.SmartMatchResultDTO;
import com.jobplus.model.JobFilterParams;
import com.jobplus.service.SmartMatchService;
import com.jobplus.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/smart-match")
@RequiredArgsConstructor
public class SmartMatchController {

    private final SmartMatchService smartMatchService;

    @GetMapping("/jobs/{jobId}")
    public ResponseEntity<ApiResponse<SmartMatchResultDTO>> getMatchForCurrentUser(@PathVariable Long jobId) {
        return ResponseEntity.ok(ApiResponse.success(
                smartMatchService.scoreJobForCandidate(SecurityUtil.getCurrentUserId(), jobId)));
    }

    @GetMapping("/jobs/recommendations")
    public ResponseEntity<ApiResponse<PaginatedResponseDTO<SmartMatchedJobDTO>>> getRankedJobs(
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
        return ResponseEntity.ok(ApiResponse.success(
                smartMatchService.rankJobsForCandidate(SecurityUtil.getCurrentUserId(), params)));
    }

    @GetMapping("/jobs/{jobId}/candidates")
    public ResponseEntity<ApiResponse<PaginatedResponseDTO<SmartMatchedCandidateDTO>>> getRankedCandidates(
            @PathVariable Long jobId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                smartMatchService.rankApplicantsForJob(jobId, SecurityUtil.getCurrentUserId(), page, size)));
    }
}
