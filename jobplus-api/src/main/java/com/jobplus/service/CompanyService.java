package com.jobplus.service;

import com.jobplus.dto.request.CreateCompanyDTO;
import com.jobplus.dto.response.CompanyResponseDTO;
import com.jobplus.dto.response.JobResponseDTO;
import com.jobplus.dto.response.PaginatedResponseDTO;
import com.jobplus.model.CompanyFilterParams;

public interface CompanyService {
    PaginatedResponseDTO<CompanyResponseDTO> getAll(CompanyFilterParams params);
    CompanyResponseDTO getById(Long id);
    CompanyResponseDTO create(CreateCompanyDTO dto, Long employerUserId);
    CompanyResponseDTO update(Long id, CreateCompanyDTO dto, Long employerUserId);
    PaginatedResponseDTO<JobResponseDTO> getJobs(Long companyId, int page, int size, Long currentUserId);
    CompanyResponseDTO getMyCompany(Long userId);
}
