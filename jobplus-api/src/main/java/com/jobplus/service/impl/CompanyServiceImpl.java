package com.jobplus.service.impl;

import com.jobplus.dto.request.CreateCompanyDTO;
import com.jobplus.dto.response.CompanyResponseDTO;
import com.jobplus.dto.response.JobResponseDTO;
import com.jobplus.dto.response.PaginatedResponseDTO;
import com.jobplus.exception.ForbiddenException;
import com.jobplus.exception.ResourceNotFoundException;
import com.jobplus.mapper.CompanyMapper;
import com.jobplus.mapper.JobMapper;
import com.jobplus.model.*;
import com.jobplus.service.CompanyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CompanyServiceImpl implements CompanyService {

    private final CompanyMapper companyMapper;
    private final JobMapper     jobMapper;

    @Override
    public PaginatedResponseDTO<CompanyResponseDTO> getAll(CompanyFilterParams params) {
        params.setOffset(params.getPage() * params.getPageSize());
        List<Company> companies = companyMapper.findAll(params);
        int total = companyMapper.countAll(params);
        List<CompanyResponseDTO> content = companies.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        return PaginatedResponseDTO.<CompanyResponseDTO>builder()
                .content(content)
                .totalElements(total)
                .totalPages(calcPages(total, params.getPageSize()))
                .currentPage(params.getPage())
                .pageSize(params.getPageSize())
                .build();
    }

    @Override
    public CompanyResponseDTO getById(Long id) {
        Company company = companyMapper.findById(id);
        if (company == null) throw new ResourceNotFoundException("Company not found: " + id);
        return toDTO(company);
    }

    @Override
    @Transactional
    public CompanyResponseDTO create(CreateCompanyDTO dto, Long employerUserId) {
        Company company = Company.builder()
                .name(dto.getName())
                .logoUrl(dto.getLogoUrl())
                .industry(dto.getIndustry())
                .size(dto.getSize() != null ? CompanySize.valueOf(dto.getSize()) : null)
                .location(dto.getLocation())
                .website(dto.getWebsite())
                .description(dto.getDescription())
                .verified(false)
                .build();
        companyMapper.insert(company);
        companyMapper.addMember(company.getId(), employerUserId);
        log.info("Created company id={} by user={}", company.getId(), employerUserId);
        return toDTO(companyMapper.findById(company.getId()));
    }

    @Override
    @Transactional
    public CompanyResponseDTO update(Long id, CreateCompanyDTO dto, Long employerUserId) {
        if (companyMapper.findById(id) == null) throw new ResourceNotFoundException("Company not found: " + id);
        Long userCompanyId = companyMapper.findCompanyIdByUserId(employerUserId);
        if (!id.equals(userCompanyId)) throw new ForbiddenException("Not your company");

        Company update = Company.builder()
                .id(id)
                .name(dto.getName())
                .logoUrl(dto.getLogoUrl())
                .industry(dto.getIndustry())
                .size(dto.getSize() != null ? CompanySize.valueOf(dto.getSize()) : null)
                .location(dto.getLocation())
                .website(dto.getWebsite())
                .description(dto.getDescription())
                .build();
        companyMapper.updateById(update);
        return toDTO(companyMapper.findById(id));
    }

    @Override
    public PaginatedResponseDTO<JobResponseDTO> getJobs(Long companyId, int page, int size, Long currentUserId) {
        if (companyMapper.findById(companyId) == null) throw new ResourceNotFoundException("Company not found: " + companyId);
        JobFilterParams params = JobFilterParams.builder()
                .companyId(companyId)
                .page(page)
                .size(size)
                .offset(page * size)
                .build();
        List<Job> jobs = jobMapper.findWithFilters(params);
        int total = jobMapper.countWithFilters(params);
        Company company = companyMapper.findById(companyId);
        CompanyResponseDTO companyDTO = toDTO(company);
        List<JobResponseDTO> content = jobs.stream()
                .map(j -> toJobDTO(j, companyDTO, currentUserId))
                .collect(Collectors.toList());
        return PaginatedResponseDTO.<JobResponseDTO>builder()
                .content(content)
                .totalElements(total)
                .totalPages(calcPages(total, size))
                .currentPage(page)
                .pageSize(size)
                .build();
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private JobResponseDTO toJobDTO(Job job, CompanyResponseDTO companyDTO, Long currentUserId) {
        Boolean saved = currentUserId != null && jobMapper.isSaved(currentUserId, job.getId());
        return JobResponseDTO.builder()
                .id(job.getId())
                .title(job.getTitle())
                .description(job.getDescription())
                .location(job.getLocation())
                .employmentType(job.getEmploymentType() != null ? job.getEmploymentType().name() : null)
                .experienceLevel(job.getExperienceLevel() != null ? job.getExperienceLevel().name() : null)
                .salaryMin(job.getSalaryMin())
                .salaryMax(job.getSalaryMax())
                .status(job.getStatus() != null ? job.getStatus().name() : null)
                .postedAt(job.getPostedAt() != null ? job.getPostedAt().toString() : null)
                .deadline(job.getDeadline() != null ? job.getDeadline().toString() : null)
                .updatedAt(job.getUpdatedAt() != null ? job.getUpdatedAt().toString() : null)
                .postedBy(job.getPostedBy())
                .company(companyDTO)
                .savedByCurrentUser(saved)
                .build();
    }

    private CompanyResponseDTO toDTO(Company c) {
        int jobCount = companyMapper.countJobsByCompanyId(c.getId());
        return CompanyResponseDTO.builder()
                .id(c.getId())
                .name(c.getName())
                .logoUrl(c.getLogoUrl())
                .industry(c.getIndustry())
                .size(c.getSize() != null ? c.getSize().name() : null)
                .location(c.getLocation())
                .website(c.getWebsite())
                .description(c.getDescription())
                .verified(c.getVerified())
                .createdAt(c.getCreatedAt() != null ? c.getCreatedAt().toString() : null)
                .jobCount(jobCount)
                .build();
    }

    @Override
    public CompanyResponseDTO getMyCompany(Long userId) {
        Long companyId = companyMapper.findCompanyIdByUserId(userId);
        if (companyId == null) return null;
        Company company = companyMapper.findById(companyId);
        return company != null ? toDTO(company) : null;
    }

    private static int calcPages(long total, int pageSize) {
        return pageSize == 0 ? 0 : (int) Math.ceil((double) total / pageSize);
    }
}
