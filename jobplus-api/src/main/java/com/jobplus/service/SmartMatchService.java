package com.jobplus.service;

import com.jobplus.dto.response.PaginatedResponseDTO;
import com.jobplus.dto.response.SmartMatchedCandidateDTO;
import com.jobplus.dto.response.SmartMatchedJobDTO;
import com.jobplus.dto.response.SmartMatchResultDTO;
import com.jobplus.model.JobFilterParams;

public interface SmartMatchService {
    SmartMatchResultDTO scoreJobForCandidate(Long candidateUserId, Long jobId);
    PaginatedResponseDTO<SmartMatchedJobDTO> rankJobsForCandidate(Long candidateUserId, JobFilterParams params);
    PaginatedResponseDTO<SmartMatchedCandidateDTO> rankApplicantsForJob(Long jobId, Long employerUserId, int page, int size);
}
