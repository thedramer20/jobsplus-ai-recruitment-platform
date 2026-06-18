package com.jobplus.service;

import com.jobplus.dto.request.ApplyJobDTO;
import com.jobplus.dto.response.ApplicationResponseDTO;
import com.jobplus.dto.response.PaginatedResponseDTO;

public interface ApplicationService {

    ApplicationResponseDTO apply(Long jobId, Long seekerId, ApplyJobDTO dto);

    PaginatedResponseDTO<ApplicationResponseDTO> getMyApplications(Long seekerId, int page, int size);

    PaginatedResponseDTO<ApplicationResponseDTO> getJobApplicants(Long jobId, Long employerUserId, int page, int size);

    ApplicationResponseDTO updateStatus(Long applicationId, String status, Long employerUserId);
}
