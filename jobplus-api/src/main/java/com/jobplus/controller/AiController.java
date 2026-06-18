package com.jobplus.controller;

import com.jobplus.dto.request.AiInterviewCoachRequestDTO;
import com.jobplus.dto.request.AiInterviewFeedbackRequestDTO;
import com.jobplus.dto.response.AiInterviewCoachSessionDTO;
import com.jobplus.dto.response.AiInterviewFeedbackDTO;
import com.jobplus.dto.response.AiJobMatchDTO;
import com.jobplus.dto.response.AiResumeAnalysisDTO;
import com.jobplus.dto.response.ApiResponse;
import com.jobplus.service.AiFeatureService;
import com.jobplus.util.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiFeatureService aiFeatureService;

    @GetMapping("/resume-analysis")
    public ResponseEntity<ApiResponse<AiResumeAnalysisDTO>> analyzeResume() {
        return ResponseEntity.ok(ApiResponse.success(
                aiFeatureService.analyzeResume(SecurityUtil.getCurrentUserId())));
    }

    @GetMapping("/job-match/{jobId}")
    public ResponseEntity<ApiResponse<AiJobMatchDTO>> getJobMatch(@PathVariable Long jobId) {
        return ResponseEntity.ok(ApiResponse.success(
                aiFeatureService.getJobMatch(SecurityUtil.getCurrentUserId(), jobId)));
    }

    @PostMapping("/interview-coach/session")
    public ResponseEntity<ApiResponse<AiInterviewCoachSessionDTO>> createInterviewSession(
            @RequestBody AiInterviewCoachRequestDTO dto) {
        return ResponseEntity.ok(ApiResponse.success(
                aiFeatureService.createInterviewSession(SecurityUtil.getCurrentUserId(), dto)));
    }

    @PostMapping("/interview-coach/feedback")
    public ResponseEntity<ApiResponse<AiInterviewFeedbackDTO>> evaluateInterviewAnswer(
            @Valid @RequestBody AiInterviewFeedbackRequestDTO dto) {
        return ResponseEntity.ok(ApiResponse.success(
                aiFeatureService.evaluateInterviewAnswer(SecurityUtil.getCurrentUserId(), dto)));
    }
}
