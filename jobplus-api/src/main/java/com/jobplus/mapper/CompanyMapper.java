package com.jobplus.mapper;

import com.jobplus.model.Company;
import com.jobplus.model.CompanyFilterParams;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface CompanyMapper {
    Company findById(Long id);
    List<Company> findAll(CompanyFilterParams params);
    int insert(Company company);
    int updateById(Company company);
    int updateVerified(@Param("id") Long id, @Param("verified") Boolean verified);
    int countAll(CompanyFilterParams params);
    int countJobsByCompanyId(Long companyId);
    Long findCompanyIdByUserId(Long userId);
    int addMember(@Param("companyId") Long companyId, @Param("userId") Long userId);
}
