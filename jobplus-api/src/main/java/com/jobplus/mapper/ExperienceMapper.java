package com.jobplus.mapper;

import com.jobplus.model.Experience;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ExperienceMapper {
    List<Experience> findByUserId(Long userId);
    int insert(Experience e);
    int updateById(Experience e);
    int deleteById(@Param("id") Long id, @Param("userId") Long userId);
}
