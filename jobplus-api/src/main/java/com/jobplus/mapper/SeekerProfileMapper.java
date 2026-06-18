package com.jobplus.mapper;

import com.jobplus.model.SeekerProfile;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface SeekerProfileMapper {
    SeekerProfile findByUserId(Long userId);
    int insert(SeekerProfile profile);
    int updateByUserId(SeekerProfile profile);
    void updateBannerGradient(@Param("userId") Long userId, @Param("bannerGradient") String bannerGradient);
}
