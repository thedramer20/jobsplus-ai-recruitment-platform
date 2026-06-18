package com.jobplus.mapper;

import com.jobplus.model.Connection;
import com.jobplus.model.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ConnectionMapper {
    List<Connection> findAcceptedByUserId(@Param("userId") Long userId);
    List<Connection> findPendingByAddresseeId(@Param("userId") Long userId);
    List<User> findSuggestions(@Param("userId") Long userId, @Param("limit") int limit);
    Connection findByUsers(@Param("requesterId") Long requesterId, @Param("addresseeId") Long addresseeId);
    Connection findById(Long id);
    int insert(Connection connection);
    int updateStatus(@Param("id") Long id, @Param("status") String status, @Param("addresseeId") Long addresseeId);
    int deleteById(@Param("id") Long id, @Param("userId") Long userId);
    int deletePendingRequest(@Param("requesterId") Long requesterId, @Param("addresseeId") Long addresseeId);
    int countAccepted(Long userId);
}
