package com.jobplus.service;

import com.jobplus.dto.response.AdminStatsDTO;
import com.jobplus.dto.response.AuditLogDTO;
import com.jobplus.dto.response.CompanyResponseDTO;
import com.jobplus.dto.response.JobResponseDTO;
import com.jobplus.dto.response.PaginatedResponseDTO;
import com.jobplus.dto.response.PostResponseDTO;
import com.jobplus.dto.response.UserResponseDTO;

public interface AdminService {
    AdminStatsDTO getStats();
    PaginatedResponseDTO<UserResponseDTO>    getUsers(String role, String status, String search, int page, int size);
    void updateUserStatus(Long id, String status, Long adminId);
    void updateUserRole(Long id, String role, Long adminId);
    void deleteUser(Long id, Long adminId);
    PaginatedResponseDTO<CompanyResponseDTO> getCompanies(Boolean verified, String search, int page, int size);
    void setCompanyVerified(Long id, boolean verified, Long adminId);
    PaginatedResponseDTO<JobResponseDTO>     getJobs(String status, String search, int page, int size);
    void updateJobStatus(Long id, String status, Long adminId);
    void deleteJob(Long id, Long adminId);
    PaginatedResponseDTO<PostResponseDTO>    getPosts(int page, int size);
    void deletePost(Long id, Long adminId);
    PaginatedResponseDTO<AuditLogDTO>        getAuditLog(int page, int size);
}
