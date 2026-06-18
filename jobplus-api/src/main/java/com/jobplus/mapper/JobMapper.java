package com.jobplus.mapper;

import com.jobplus.model.Job;
import com.jobplus.model.JobFilterParams;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface JobMapper {
    Job findById(Long id);
    int insert(Job job);
    int updateById(Job job);
    int updateStatus(@Param("id") Long id, @Param("status") String status, @Param("postedBy") Long postedBy);
    int deleteById(@Param("id") Long id, @Param("postedBy") Long postedBy);
    List<Job> findWithFilters(JobFilterParams params);
    List<Job> findOpenForSmartMatch(JobFilterParams params);
    int countWithFilters(JobFilterParams params);
    List<Job> findSavedByUserId(Long userId);
    int saveJob(@Param("userId") Long userId, @Param("jobId") Long jobId);
    int unsaveJob(@Param("userId") Long userId, @Param("jobId") Long jobId);
    boolean isSaved(@Param("userId") Long userId, @Param("jobId") Long jobId);
}
