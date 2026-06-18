package com.jobplus.service.impl;

import com.jobplus.dto.request.ApplyJobDTO;
import com.jobplus.dto.response.*;
import com.jobplus.exception.ConflictException;
import com.jobplus.exception.ForbiddenException;
import com.jobplus.exception.ResourceNotFoundException;
import com.jobplus.exception.ValidationException;
import com.jobplus.mapper.*;
import com.jobplus.model.*;
import com.jobplus.service.ApplicationService;
import com.jobplus.service.EmailService;
import com.jobplus.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ApplicationServiceImpl implements ApplicationService {

    private final ApplicationMapper   applicationMapper;
    private final JobMapper           jobMapper;
    private final CompanyMapper       companyMapper;
    private final UserMapper          userMapper;
    private final SeekerProfileMapper seekerProfileMapper;
    private final NotificationService notificationService;
    private final EmailService        emailService;

    @Override
    @Transactional
    public ApplicationResponseDTO apply(Long jobId, Long seekerId, ApplyJobDTO dto) {
        Job job = jobMapper.findById(jobId);
        if (job == null) throw new ResourceNotFoundException("Job not found: " + jobId);
        if (job.getStatus() != JobStatus.OPEN)
            throw new ValidationException("Job is not open for applications");
        if (applicationMapper.existsByJobAndSeeker(jobId, seekerId))
            throw new ConflictException("Already applied to this job");

        // Fall back to the resume stored on the seeker's profile when the
        // application doesn't carry an explicit one.
        String resumeUrl = dto.getResumeUrl();
        if (resumeUrl == null || resumeUrl.isBlank()) {
            SeekerProfile profile = seekerProfileMapper.findByUserId(seekerId);
            resumeUrl = profile != null ? profile.getResumeUrl() : null;
        }

        Application app = Application.builder()
                .jobId(jobId)
                .seekerId(seekerId)
                .coverLetter(dto.getCoverLetter())
                .resumeUrl(resumeUrl)
                .build();
        applicationMapper.insert(app);
        log.info("User {} applied to job {}", seekerId, jobId);

        User seeker = userMapper.findById(seekerId);
        String seekerName = seeker != null && seeker.getName() != null ? seeker.getName() : "Someone";
        try {
            notificationService.create(job.getPostedBy(), "NEW_APPLICATION",
                    Map.of("jobId", jobId, "jobTitle", job.getTitle(), "seekerName", seekerName));
        } catch (Exception e) {
            log.warn("Notification failed for application job={} seeker={}: {}", jobId, seekerId, e.getMessage());
        }
        try {
            User employer = userMapper.findById(job.getPostedBy());
            if (employer != null && employer.getEmail() != null) {
                emailService.sendNewApplicationAlert(
                        employer.getEmail(), employer.getName(), seekerName, job.getTitle(), jobId);
            }
        } catch (Exception e) {
            log.warn("Email failed for new application job={}: {}", jobId, e.getMessage());
        }

        return toDTO(applicationMapper.findById(app.getId()));
    }

    @Override
    public PaginatedResponseDTO<ApplicationResponseDTO> getMyApplications(Long seekerId, int page, int size) {
        int offset = page * size;
        List<Application> apps = applicationMapper.findBySeekerId(seekerId, size, offset);
        int total = applicationMapper.countBySeekerId(seekerId);
        List<ApplicationResponseDTO> content = apps.stream().map(this::toDTO).collect(Collectors.toList());
        return buildPage(content, total, page, size);
    }

    @Override
    public PaginatedResponseDTO<ApplicationResponseDTO> getJobApplicants(Long jobId, Long employerUserId, int page, int size) {
        Job job = jobMapper.findById(jobId);
        if (job == null) throw new ResourceNotFoundException("Job not found: " + jobId);
        if (!job.getPostedBy().equals(employerUserId)) throw new ForbiddenException("Not your job");
        int offset = page * size;
        List<Application> apps = applicationMapper.findByJobId(jobId, size, offset);
        int total = applicationMapper.countByJobId(jobId);
        List<ApplicationResponseDTO> content = apps.stream().map(this::toDTO).collect(Collectors.toList());
        return buildPage(content, total, page, size);
    }

    @Override
    @Transactional
    public ApplicationResponseDTO updateStatus(Long applicationId, String status, Long employerUserId) {
        int rows = applicationMapper.updateStatus(applicationId, status, employerUserId);
        if (rows == 0) throw new ForbiddenException("Application not found or not your job");

        Application app = applicationMapper.findById(applicationId);
        Job job = jobMapper.findById(app.getJobId());
        String jobTitle = job != null ? job.getTitle() : "";
        notificationService.create(app.getSeekerId(), "APPLICATION_STATUS_UPDATED",
                Map.of("jobId", app.getJobId(), "jobTitle", jobTitle, "status", status));
        try {
            User seeker = userMapper.findById(app.getSeekerId());
            if (seeker != null && seeker.getEmail() != null) {
                emailService.sendApplicationStatusUpdate(
                        seeker.getEmail(), seeker.getName(), jobTitle, status, app.getJobId());
            }
        } catch (Exception e) {
            log.warn("Email failed for status update application={}: {}", applicationId, e.getMessage());
        }

        return toDTO(app);
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private ApplicationResponseDTO toDTO(Application app) {
        Job job = jobMapper.findById(app.getJobId());
        Company company = job != null ? companyMapper.findById(job.getCompanyId()) : null;
        JobResponseDTO jobDTO = job != null ? toJobDTO(job, company) : null;
        User seeker = userMapper.findById(app.getSeekerId());
        UserResponseDTO seekerDTO = seeker != null ? UserResponseDTO.fromUser(seeker) : null;

        return ApplicationResponseDTO.builder()
                .id(app.getId())
                .jobId(app.getJobId())
                .seekerId(app.getSeekerId())
                .status(app.getStatus() != null ? app.getStatus().name() : null)
                .coverLetter(app.getCoverLetter())
                .resumeUrl(app.getResumeUrl())
                .appliedAt(app.getAppliedAt() != null ? app.getAppliedAt().toString() : null)
                .updatedAt(app.getUpdatedAt() != null ? app.getUpdatedAt().toString() : null)
                .job(jobDTO)
                .seeker(seekerDTO)
                .build();
    }

    private JobResponseDTO toJobDTO(Job job, Company company) {
        CompanyResponseDTO companyDTO = company != null ? toCompanyDTO(company) : null;
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
                .postedBy(job.getPostedBy())
                .company(companyDTO)
                .build();
    }

    private CompanyResponseDTO toCompanyDTO(Company c) {
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
                .jobCount(jobCount)
                .build();
    }

    private static PaginatedResponseDTO<ApplicationResponseDTO> buildPage(
            List<ApplicationResponseDTO> content, int total, int page, int size) {
        int totalPages = size == 0 ? 0 : (int) Math.ceil((double) total / size);
        return PaginatedResponseDTO.<ApplicationResponseDTO>builder()
                .content(content)
                .totalElements(total)
                .totalPages(totalPages)
                .currentPage(page)
                .pageSize(size)
                .build();
    }
}
