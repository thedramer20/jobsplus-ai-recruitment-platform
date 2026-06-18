package com.jobplus.service.impl;

import com.jobplus.dto.request.CreateJobDTO;
import com.jobplus.dto.request.UpdateJobDTO;
import com.jobplus.dto.response.CompanyResponseDTO;
import com.jobplus.dto.response.JobResponseDTO;
import com.jobplus.dto.response.PaginatedResponseDTO;
import com.jobplus.exception.ForbiddenException;
import com.jobplus.exception.ResourceNotFoundException;
import com.jobplus.mapper.ApplicationMapper;
import com.jobplus.mapper.CompanyMapper;
import com.jobplus.mapper.JobMapper;
import com.jobplus.model.*;
import com.jobplus.service.JobService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class JobServiceImpl implements JobService {

    private final JobMapper         jobMapper;
    private final CompanyMapper     companyMapper;
    private final ApplicationMapper applicationMapper;

    @Override
    public PaginatedResponseDTO<JobResponseDTO> getJobs(JobFilterParams params, Long currentUserId) {
        params.setOffset(params.getPage() * params.getSize());
        List<Job> jobs = jobMapper.findWithFilters(params);
        int total = jobMapper.countWithFilters(params);
        List<JobResponseDTO> content = jobs.stream()
                .map(j -> toDTO(j, currentUserId))
                .collect(Collectors.toList());
        return PaginatedResponseDTO.<JobResponseDTO>builder()
                .content(content)
                .totalElements(total)
                .totalPages(calcPages(total, params.getSize()))
                .currentPage(params.getPage())
                .pageSize(params.getSize())
                .build();
    }

    @Override
    public JobResponseDTO getById(Long id, Long currentUserId) {
        Job job = jobMapper.findById(id);
        if (job == null) throw new ResourceNotFoundException("Job not found: " + id);
        return toDTO(job, currentUserId);
    }

    @Override
    @Transactional
    public JobResponseDTO create(CreateJobDTO dto, Long employerUserId) {
        Long companyId = companyMapper.findCompanyIdByUserId(employerUserId);
        if (companyId == null) throw new ForbiddenException("User is not a member of any company");

        Job job = Job.builder()
                .companyId(companyId)
                .postedBy(employerUserId)
                .title(dto.getTitle())
                .description(dto.getDescription())
                .location(dto.getLocation())
                .employmentType(EmploymentType.valueOf(dto.getEmploymentType()))
                .experienceLevel(ExperienceLevel.valueOf(dto.getExperienceLevel()))
                .salaryMin(dto.getSalaryMin())
                .salaryMax(dto.getSalaryMax())
                .status(JobStatus.OPEN)
                .deadline(dto.getDeadline() != null ? LocalDate.parse(dto.getDeadline()) : null)
                .build();

        jobMapper.insert(job);
        log.info("Created job id={} by user={}", job.getId(), employerUserId);
        return toDTO(jobMapper.findById(job.getId()), employerUserId);
    }

    @Override
    @Transactional
    public JobResponseDTO update(Long id, UpdateJobDTO dto, Long employerUserId) {
        Job existing = jobMapper.findById(id);
        if (existing == null) throw new ResourceNotFoundException("Job not found: " + id);
        if (!existing.getPostedBy().equals(employerUserId)) throw new ForbiddenException("Not your job");

        Job update = Job.builder()
                .id(id)
                .postedBy(employerUserId)
                .title(dto.getTitle())
                .description(dto.getDescription())
                .location(dto.getLocation())
                .employmentType(dto.getEmploymentType() != null ? EmploymentType.valueOf(dto.getEmploymentType()) : null)
                .experienceLevel(dto.getExperienceLevel() != null ? ExperienceLevel.valueOf(dto.getExperienceLevel()) : null)
                .salaryMin(dto.getSalaryMin())
                .salaryMax(dto.getSalaryMax())
                .status(dto.getStatus() != null ? JobStatus.valueOf(dto.getStatus()) : null)
                .deadline(dto.getDeadline() != null ? LocalDate.parse(dto.getDeadline()) : null)
                .build();

        jobMapper.updateById(update);
        return toDTO(jobMapper.findById(id), employerUserId);
    }

    @Override
    @Transactional
    public void delete(Long id, Long employerUserId) {
        Job existing = jobMapper.findById(id);
        if (existing == null) throw new ResourceNotFoundException("Job not found: " + id);
        if (!existing.getPostedBy().equals(employerUserId)) throw new ForbiddenException("Not your job");
        jobMapper.deleteById(id, employerUserId);
    }

    @Override
    @Transactional
    public void save(Long jobId, Long userId) {
        if (jobMapper.findById(jobId) == null) throw new ResourceNotFoundException("Job not found: " + jobId);
        jobMapper.saveJob(userId, jobId);
    }

    @Override
    @Transactional
    public void unsave(Long jobId, Long userId) {
        jobMapper.unsaveJob(userId, jobId);
    }

    @Override
    public PaginatedResponseDTO<JobResponseDTO> getSaved(Long userId, int page, int size) {
        List<Job> all = jobMapper.findSavedByUserId(userId);
        int total = all.size();
        int offset = page * size;
        List<JobResponseDTO> content = all.stream()
                .skip(offset)
                .limit(size)
                .map(j -> toDTO(j, userId))
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

    private JobResponseDTO toDTO(Job job, Long currentUserId) {
        Company company = companyMapper.findById(job.getCompanyId());
        CompanyResponseDTO companyDTO = company != null ? toCompanyDTO(company) : null;
        Boolean saved = currentUserId != null && jobMapper.isSaved(currentUserId, job.getId());
        Boolean applied = currentUserId != null && applicationMapper.existsByJobAndSeeker(job.getId(), currentUserId);
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
                .appliedByCurrentUser(applied)
                .build();
    }

    CompanyResponseDTO toCompanyDTO(Company c) {
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

    private static int calcPages(long total, int pageSize) {
        return pageSize == 0 ? 0 : (int) Math.ceil((double) total / pageSize);
    }
}
