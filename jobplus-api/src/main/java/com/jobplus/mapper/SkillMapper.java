package com.jobplus.mapper;

import com.jobplus.model.Skill;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface SkillMapper {
    List<Skill> findAll();
    Skill findById(Long id);
    Skill findByName(String name);
    int insert(Skill skill);
    List<Skill> findByUserId(Long userId);
    List<Skill> findByJobId(Long jobId);
    int addUserSkill(@Param("userId") Long userId, @Param("skillId") Long skillId);
    int removeUserSkill(@Param("userId") Long userId, @Param("skillId") Long skillId);
}
