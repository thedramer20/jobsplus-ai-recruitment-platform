package com.jobplus.mapper;

import com.jobplus.dto.response.AdminStatsDTO;
import com.jobplus.model.AuditLog;
import com.jobplus.model.Company;
import com.jobplus.model.Job;
import com.jobplus.model.Post;
import com.jobplus.model.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface AdminMapper {

    // Stats
    long countAllUsers();
    long countUsersByRole(@Param("role") String role);
    long countAllJobs();
    long countJobsByStatus(@Param("status") String status);
    long countAllApplications();
    long countAllCompanies();
    long countNewUsers(@Param("days") int days);
    List<AdminStatsDTO.DailyCount>  getSignupsLast30Days();
    List<AdminStatsDTO.StatusCount> getApplicationsByStatus();

    // Users
    List<User> getUsersPaginated(@Param("role") String role,
                                 @Param("status") String status,
                                 @Param("search") String search,
                                 @Param("limit") int limit,
                                 @Param("offset") int offset);
    long countUsers(@Param("role") String role,
                    @Param("status") String status,
                    @Param("search") String search);
    int updateUserStatus(@Param("id") Long id, @Param("status") String status);
    int updateUserRole(@Param("id") Long id, @Param("role") String role);
    int deleteUser(@Param("id") Long id);

    // Companies
    List<Company> getCompaniesPaginated(@Param("verified") Boolean verified,
                                        @Param("search") String search,
                                        @Param("limit") int limit,
                                        @Param("offset") int offset);
    long countCompanies(@Param("verified") Boolean verified,
                        @Param("search") String search);
    int setCompanyVerified(@Param("id") Long id, @Param("verified") boolean verified);

    // Jobs
    List<Job> getJobsPaginated(@Param("status") String status,
                               @Param("search") String search,
                               @Param("limit") int limit,
                               @Param("offset") int offset);
    long countJobs(@Param("status") String status, @Param("search") String search);
    int updateJobStatus(@Param("id") Long id, @Param("status") String status);
    int deleteJob(@Param("id") Long id);

    // Posts
    List<Post> getPostsPaginated(@Param("limit") int limit, @Param("offset") int offset);
    long countPosts();
    int deletePost(@Param("id") Long id);

    // Audit log
    List<AuditLog> getAuditLog(@Param("limit") int limit, @Param("offset") int offset);
    long countAuditLog();
    int insertAuditLog(AuditLog log);
}
