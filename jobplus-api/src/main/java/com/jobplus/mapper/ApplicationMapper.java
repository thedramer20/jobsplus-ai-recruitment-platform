package com.jobplus.mapper;

import com.jobplus.model.Application;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ApplicationMapper {

    Application findById(Long id);

    List<Application> findBySeekerId(@Param("seekerId") Long seekerId,
                                     @Param("limit")    int    limit,
                                     @Param("offset")   int    offset);

    int countBySeekerId(Long seekerId);

    List<Application> findByJobId(@Param("jobId")  Long jobId,
                                  @Param("limit")  int  limit,
                                  @Param("offset") int  offset);

    List<Application> findAllByJobId(Long jobId);

    int countByJobId(Long jobId);

    int insert(Application application);

    int updateStatus(@Param("id")          Long   id,
                     @Param("status")      String status,
                     @Param("jobPostedBy") Long   jobPostedBy);

    boolean existsByJobAndSeeker(@Param("jobId")    Long jobId,
                                 @Param("seekerId") Long seekerId);
}
