package com.jobplus.mapper;

import com.jobplus.model.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface UserMapper {
    User findById(Long id);
    User findByEmail(String email);
    int insert(User user);
    int updateById(User user);
    int updateStatus(@Param("id") Long id, @Param("status") String status);
    boolean existsByEmail(String email);
    int updatePassword(@Param("id") Long id, @Param("passwordHash") String passwordHash);
    int updateAvatarUrl(@Param("id") Long id, @Param("avatarUrl") String avatarUrl);
    int updateEmail(@Param("id") Long id, @Param("email") String email);
}
