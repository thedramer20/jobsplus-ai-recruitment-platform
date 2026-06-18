package com.jobplus.mapper;

import com.jobplus.model.Education;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface EducationMapper {
    List<Education> findByUserId(Long userId);
    int insert(Education e);
    int updateById(Education e);
    int deleteById(@Param("id") Long id, @Param("userId") Long userId);
}
