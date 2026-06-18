package com.jobplus.service;

import com.jobplus.dto.request.CreateJobDTO;
import com.jobplus.dto.request.UpdateJobDTO;
import com.jobplus.dto.response.JobResponseDTO;
import com.jobplus.dto.response.PaginatedResponseDTO;
import com.jobplus.model.JobFilterParams;

public interface JobService {
    PaginatedResponseDTO<JobResponseDTO> getJobs(JobFilterParams params, Long currentUserId);
    JobResponseDTO getById(Long id, Long currentUserId);
    JobResponseDTO create(CreateJobDTO dto, Long employerUserId);
    JobResponseDTO update(Long id, UpdateJobDTO dto, Long employerUserId);
    void delete(Long id, Long employerUserId);
    void save(Long jobId, Long userId);
    void unsave(Long jobId, Long userId);
    PaginatedResponseDTO<JobResponseDTO> getSaved(Long userId, int page, int size);
}
