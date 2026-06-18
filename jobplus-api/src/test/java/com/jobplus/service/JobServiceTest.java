package com.jobplus.service;

import com.jobplus.dto.request.CreateJobDTO;
import com.jobplus.dto.response.JobResponseDTO;
import com.jobplus.dto.response.PaginatedResponseDTO;
import com.jobplus.exception.ForbiddenException;
import com.jobplus.exception.ResourceNotFoundException;
import com.jobplus.mapper.CompanyMapper;
import com.jobplus.mapper.JobMapper;
import com.jobplus.model.*;
import com.jobplus.service.impl.JobServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JobServiceTest {

    @Mock JobMapper     jobMapper;
    @Mock CompanyMapper companyMapper;

    @InjectMocks JobServiceImpl jobService;

    // ── fixtures ──────────────────────────────────────────────────────────────

    private Job sampleJob(Long id, Long companyId, Long postedBy) {
        return Job.builder()
                .id(id).companyId(companyId).postedBy(postedBy)
                .title("Java Developer").description("Build REST APIs")
                .location("Remote").employmentType(EmploymentType.REMOTE)
                .experienceLevel(ExperienceLevel.MID)
                .salaryMin(new BigDecimal("50000")).salaryMax(new BigDecimal("80000"))
                .status(JobStatus.OPEN).postedAt(LocalDateTime.now())
                .build();
    }

    private Company sampleCompany(Long id) {
        return Company.builder()
                .id(id).name("TechCorp").industry("Technology")
                .size(CompanySize.MEDIUM).verified(true)
                .build();
    }

    // ── tests ─────────────────────────────────────────────────────────────────

    @Test
    void getJobs_noFilters_returnsPaginatedResult() {
        Job job = sampleJob(1L, 10L, 5L);
        when(jobMapper.findWithFilters(any())).thenReturn(List.of(job));
        when(jobMapper.countWithFilters(any())).thenReturn(1);
        when(companyMapper.findById(10L)).thenReturn(sampleCompany(10L));
        when(companyMapper.countJobsByCompanyId(10L)).thenReturn(3);
        when(jobMapper.isSaved(anyLong(), anyLong())).thenReturn(false);

        JobFilterParams params = JobFilterParams.builder().page(0).size(20).build();
        PaginatedResponseDTO<JobResponseDTO> result = jobService.getJobs(params, null);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getCurrentPage()).isEqualTo(0);
        assertThat(result.getContent().get(0).getTitle()).isEqualTo("Java Developer");
    }

    @Test
    void getById_existingJob_returnsJobWithCompany() {
        Job job = sampleJob(1L, 10L, 5L);
        Company company = sampleCompany(10L);
        when(jobMapper.findById(1L)).thenReturn(job);
        when(companyMapper.findById(10L)).thenReturn(company);
        when(companyMapper.countJobsByCompanyId(10L)).thenReturn(2);
        when(jobMapper.isSaved(99L, 1L)).thenReturn(true);

        JobResponseDTO result = jobService.getById(1L, 99L);

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getCompany()).isNotNull();
        assertThat(result.getCompany().getName()).isEqualTo("TechCorp");
        assertThat(result.getSavedByCurrentUser()).isTrue();
    }

    @Test
    void getById_unknownId_throwsResourceNotFoundException() {
        when(jobMapper.findById(999L)).thenReturn(null);

        assertThatThrownBy(() -> jobService.getById(999L, null))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("999");
    }

    @Test
    void create_validEmployer_insertsAndReturnsJob() {
        Long employerId = 5L;
        Long companyId  = 10L;
        Job inserted = sampleJob(1L, companyId, employerId);

        when(companyMapper.findCompanyIdByUserId(employerId)).thenReturn(companyId);
        doAnswer(inv -> { ((Job) inv.getArgument(0)).setId(1L); return 1; })
                .when(jobMapper).insert(any(Job.class));
        when(jobMapper.findById(1L)).thenReturn(inserted);
        when(companyMapper.findById(companyId)).thenReturn(sampleCompany(companyId));
        when(companyMapper.countJobsByCompanyId(companyId)).thenReturn(1);
        when(jobMapper.isSaved(anyLong(), eq(1L))).thenReturn(false);

        CreateJobDTO dto = new CreateJobDTO();
        dto.setTitle("Java Developer");
        dto.setDescription("Build REST APIs");
        dto.setEmploymentType("REMOTE");
        dto.setExperienceLevel("MID");

        JobResponseDTO result = jobService.create(dto, employerId);

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getTitle()).isEqualTo("Java Developer");
        verify(jobMapper).insert(any(Job.class));
    }

    @Test
    void create_userNotInCompany_throwsForbiddenException() {
        when(companyMapper.findCompanyIdByUserId(99L)).thenReturn(null);

        CreateJobDTO dto = new CreateJobDTO();
        dto.setTitle("Dev");
        dto.setDescription("Desc");
        dto.setEmploymentType("FULL_TIME");
        dto.setExperienceLevel("ENTRY");

        assertThatThrownBy(() -> jobService.create(dto, 99L))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    void delete_byNonOwner_throwsForbiddenException() {
        Job job = sampleJob(1L, 10L, 5L); // owned by user 5
        when(jobMapper.findById(1L)).thenReturn(job);

        assertThatThrownBy(() -> jobService.delete(1L, 99L)) // different user
                .isInstanceOf(ForbiddenException.class);

        verify(jobMapper, never()).deleteById(anyLong(), anyLong());
    }

    @Test
    void save_existingJob_callsSaveJob() {
        when(jobMapper.findById(1L)).thenReturn(sampleJob(1L, 10L, 5L));

        jobService.save(1L, 7L);

        verify(jobMapper).saveJob(7L, 1L);
    }
}
