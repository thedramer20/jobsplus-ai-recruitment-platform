package com.jobplus.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
public class AdminStatsDTO {

    private long totalUsers;
    private long totalSeekers;
    private long totalEmployers;
    private long totalJobs;
    private long openJobs;
    private long totalApplications;
    private long totalCompanies;
    private long newUsersLast30Days;
    private List<DailyCount>  signupsLast30Days;
    private List<StatusCount> applicationsByStatus;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyCount {
        private String date;
        private long   count;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatusCount {
        private String status;
        private long   count;
    }
}
