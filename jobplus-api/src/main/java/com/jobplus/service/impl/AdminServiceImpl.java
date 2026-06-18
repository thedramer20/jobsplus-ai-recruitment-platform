package com.jobplus.service.impl;

import com.jobplus.dto.response.AdminStatsDTO;
import com.jobplus.dto.response.AuditLogDTO;
import com.jobplus.dto.response.CompanyResponseDTO;
import com.jobplus.dto.response.JobResponseDTO;
import com.jobplus.dto.response.PaginatedResponseDTO;
import com.jobplus.dto.response.PostResponseDTO;
import com.jobplus.dto.response.UserResponseDTO;
import com.jobplus.mapper.AdminMapper;
import com.jobplus.mapper.CompanyMapper;
import com.jobplus.mapper.UserMapper;
import com.jobplus.model.AuditLog;
import com.jobplus.model.Company;
import com.jobplus.model.Job;
import com.jobplus.model.Post;
import com.jobplus.model.User;
import com.jobplus.service.AdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AdminServiceImpl implements AdminService {

    private final AdminMapper   adminMapper;
    private final CompanyMapper companyMapper;
    private final UserMapper    userMapper;

    // ── Stats ─────────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public AdminStatsDTO getStats() {
        return AdminStatsDTO.builder()
                .totalUsers(adminMapper.countAllUsers())
                .totalSeekers(adminMapper.countUsersByRole("JOB_SEEKER"))
                .totalEmployers(adminMapper.countUsersByRole("EMPLOYER"))
                .totalJobs(adminMapper.countAllJobs())
                .openJobs(adminMapper.countJobsByStatus("OPEN"))
                .totalApplications(adminMapper.countAllApplications())
                .totalCompanies(adminMapper.countAllCompanies())
                .newUsersLast30Days(adminMapper.countNewUsers(30))
                .signupsLast30Days(adminMapper.getSignupsLast30Days())
                .applicationsByStatus(adminMapper.getApplicationsByStatus())
                .build();
    }

    // ── Users ─────────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public PaginatedResponseDTO<UserResponseDTO> getUsers(String role, String status,
                                                          String search, int page, int size) {
        int offset = page * size;
        List<User> users = adminMapper.getUsersPaginated(role, status, search, size, offset);
        long total = adminMapper.countUsers(role, status, search);
        List<UserResponseDTO> content = users.stream()
                .map(UserResponseDTO::fromUser)
                .collect(Collectors.toList());
        return buildPage(content, total, page, size);
    }

    @Override
    public void updateUserStatus(Long id, String status, Long adminId) {
        adminMapper.updateUserStatus(id, status);
        audit(adminId, "UPDATE_USER_STATUS", "USER", id, "status=" + status);
        log.info("Admin {} set user {} status={}", adminId, id, status);
    }

    @Override
    public void updateUserRole(Long id, String role, Long adminId) {
        adminMapper.updateUserRole(id, role);
        audit(adminId, "UPDATE_USER_ROLE", "USER", id, "role=" + role);
        log.info("Admin {} set user {} role={}", adminId, id, role);
    }

    @Override
    public void deleteUser(Long id, Long adminId) {
        adminMapper.deleteUser(id);
        audit(adminId, "DELETE_USER", "USER", id, null);
        log.info("Admin {} deleted user {}", adminId, id);
    }

    // ── Companies ─────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public PaginatedResponseDTO<CompanyResponseDTO> getCompanies(Boolean verified, String search,
                                                                  int page, int size) {
        int offset = page * size;
        List<Company> companies = adminMapper.getCompaniesPaginated(verified, search, size, offset);
        long total = adminMapper.countCompanies(verified, search);
        List<CompanyResponseDTO> content = companies.stream()
                .map(this::toCompanyDTO)
                .collect(Collectors.toList());
        return buildPage(content, total, page, size);
    }

    @Override
    public void setCompanyVerified(Long id, boolean verified, Long adminId) {
        adminMapper.setCompanyVerified(id, verified);
        audit(adminId, "SET_COMPANY_VERIFIED", "COMPANY", id, "verified=" + verified);
        log.info("Admin {} set company {} verified={}", adminId, id, verified);
    }

    // ── Jobs ──────────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public PaginatedResponseDTO<JobResponseDTO> getJobs(String status, String search,
                                                        int page, int size) {
        int offset = page * size;
        List<Job> jobs = adminMapper.getJobsPaginated(status, search, size, offset);
        long total = adminMapper.countJobs(status, search);
        List<JobResponseDTO> content = jobs.stream()
                .map(this::toJobDTO)
                .collect(Collectors.toList());
        return buildPage(content, total, page, size);
    }

    @Override
    public void updateJobStatus(Long id, String status, Long adminId) {
        adminMapper.updateJobStatus(id, status);
        audit(adminId, "UPDATE_JOB_STATUS", "JOB", id, "status=" + status);
        log.info("Admin {} set job {} status={}", adminId, id, status);
    }

    @Override
    public void deleteJob(Long id, Long adminId) {
        adminMapper.deleteJob(id);
        audit(adminId, "DELETE_JOB", "JOB", id, null);
        log.info("Admin {} deleted job {}", adminId, id);
    }

    // ── Posts ─────────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public PaginatedResponseDTO<PostResponseDTO> getPosts(int page, int size) {
        int offset = page * size;
        List<Post> posts = adminMapper.getPostsPaginated(size, offset);
        long total = adminMapper.countPosts();
        List<PostResponseDTO> content = posts.stream()
                .map(this::toPostDTO)
                .collect(Collectors.toList());
        return buildPage(content, total, page, size);
    }

    @Override
    public void deletePost(Long id, Long adminId) {
        adminMapper.deletePost(id);
        audit(adminId, "DELETE_POST", "POST", id, null);
        log.info("Admin {} deleted post {}", adminId, id);
    }

    // ── Audit Log ─────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public PaginatedResponseDTO<AuditLogDTO> getAuditLog(int page, int size) {
        int offset = page * size;
        List<AuditLog> logs = adminMapper.getAuditLog(size, offset);
        long total = adminMapper.countAuditLog();

        // resolve admin names
        List<AuditLogDTO> content = logs.stream().map(al -> {
            User admin = userMapper.findById(al.getAdminId());
            return AuditLogDTO.builder()
                    .id(al.getId())
                    .adminId(al.getAdminId())
                    .adminName(admin != null ? admin.getName() : null)
                    .action(al.getAction())
                    .targetType(al.getTargetType())
                    .targetId(al.getTargetId())
                    .detail(al.getDetail())
                    .createdAt(al.getCreatedAt() != null ? al.getCreatedAt().toString() : null)
                    .build();
        }).collect(Collectors.toList());

        return buildPage(content, total, page, size);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void audit(Long adminId, String action, String targetType, Long targetId, String detail) {
        AuditLog entry = AuditLog.builder()
                .adminId(adminId)
                .action(action)
                .targetType(targetType)
                .targetId(targetId)
                .detail(detail)
                .build();
        adminMapper.insertAuditLog(entry);
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
                .createdAt(c.getCreatedAt() != null ? c.getCreatedAt().toString() : null)
                .jobCount(jobCount)
                .build();
    }

    private JobResponseDTO toJobDTO(Job job) {
        Company company = job.getCompanyId() != null ? companyMapper.findById(job.getCompanyId()) : null;
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
                .updatedAt(job.getUpdatedAt() != null ? job.getUpdatedAt().toString() : null)
                .postedBy(job.getPostedBy())
                .company(companyDTO)
                .savedByCurrentUser(false)
                .build();
    }

    private PostResponseDTO toPostDTO(Post post) {
        User author = userMapper.findById(post.getAuthorId());
        UserResponseDTO authorDTO = author != null ? UserResponseDTO.fromUser(author) : null;
        return PostResponseDTO.builder()
                .id(post.getId())
                .author(authorDTO)
                .content(post.getContent())
                .mediaUrl(post.getMediaUrl())
                .likeCount(post.getLikeCount())
                .commentCount(post.getCommentCount())
                .likedByCurrentUser(false)
                .createdAt(post.getCreatedAt() != null ? post.getCreatedAt().toString() : null)
                .build();
    }

    private static <T> PaginatedResponseDTO<T> buildPage(List<T> content, long total, int page, int size) {
        int totalPages = size == 0 ? 0 : (int) Math.ceil((double) total / size);
        return PaginatedResponseDTO.<T>builder()
                .content(content)
                .totalElements(total)
                .totalPages(totalPages)
                .currentPage(page)
                .pageSize(size)
                .build();
    }
}
