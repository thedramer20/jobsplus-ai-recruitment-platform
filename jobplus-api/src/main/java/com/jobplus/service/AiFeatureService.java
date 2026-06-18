package com.jobplus.service;

import com.jobplus.dto.request.AiInterviewCoachRequestDTO;
import com.jobplus.dto.request.AiInterviewFeedbackRequestDTO;
import com.jobplus.dto.response.AiInterviewCoachSessionDTO;
import com.jobplus.dto.response.AiInterviewFeedbackDTO;
import com.jobplus.dto.response.AiJobMatchDTO;
import com.jobplus.dto.response.AiResumeAnalysisDTO;

public interface AiFeatureService {
    AiResumeAnalysisDTO analyzeResume(Long userId);
    AiJobMatchDTO getJobMatch(Long userId, Long jobId);
    AiInterviewCoachSessionDTO createInterviewSession(Long userId, AiInterviewCoachRequestDTO dto);
    AiInterviewFeedbackDTO evaluateInterviewAnswer(Long userId, AiInterviewFeedbackRequestDTO dto);
}
