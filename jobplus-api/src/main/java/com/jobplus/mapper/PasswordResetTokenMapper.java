package com.jobplus.mapper;

import com.jobplus.model.PasswordResetToken;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface PasswordResetTokenMapper {
    int insert(PasswordResetToken token);
    PasswordResetToken findByTokenHash(@Param("tokenHash") String tokenHash);
    int markUsed(@Param("id") Long id);
    int invalidateAllForUser(@Param("userId") Long userId);
}
