package com.jobplus.service;

import com.jobplus.dto.request.ApplyJobDTO;
import com.jobplus.dto.response.ApplicationResponseDTO;
import com.jobplus.exception.ConflictException;
import com.jobplus.exception.ForbiddenException;
import com.jobplus.exception.ResourceNotFoundException;
import com.jobplus.mapper.ApplicationMapper;
import com.jobplus.mapper.CompanyMapper;
import com.jobplus.mapper.JobMapper;
import com.jobplus.mapper.UserMapper;
import com.jobplus.model.Application;
import com.jobplus.model.ApplicationStatus;
import com.jobplus.model.Job;
import com.jobplus.model.JobStatus;
import com.jobplus.model.User;
import com.jobplus.service.impl.ApplicationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ApplicationServiceTest {

    @Mock ApplicationMapper     applicationMapper;
    @Mock JobMapper             jobMapper;
    @Mock CompanyMapper         companyMapper;
    @Mock UserMapper            userMapper;
    @Mock NotificationService   notificationService;

    @InjectMocks ApplicationServiceImpl applicationService;

    private Job     openJob;
    private User    seeker;
    private ApplyJobDTO applyDTO;

    @BeforeEach
    void setUp() {
        openJob = Job.builder()
                .id(10L)
                .title("Backend Engineer")
                .postedBy(99L)
                .companyId(5L)
                .status(JobStatus.OPEN)
                .build();

        seeker = User.builder()
                .id(1L)
                .name("Alice")
                .email("alice@example.com")
                .build();

        applyDTO = new ApplyJobDTO();
        applyDTO.setCoverLetter("I am interested");
        applyDTO.setResumeUrl("https://example.com/resume.pdf");
    }

    // ── apply() ──────────────────────────────────────────────────────────────

    @Test
    void apply_happyPath_insertsApplicationAndCreatesNotification() {
        Application savedApp = Application.builder()
                .id(100L)
                .jobId(openJob.getId())
                .seekerId(seeker.getId())
                .status(ApplicationStatus.APPLIED)
                .coverLetter(applyDTO.getCoverLetter())
                .resumeUrl(applyDTO.getResumeUrl())
                .build();

        when(jobMapper.findById(openJob.getId())).thenReturn(openJob);
        when(applicationMapper.existsByJobAndSeeker(openJob.getId(), seeker.getId())).thenReturn(false);
        // insert sets id via MyBatis useGeneratedKeys; the saved Application already has id=100
        when(applicationMapper.findById(any())).thenReturn(savedApp);
        when(userMapper.findById(seeker.getId())).thenReturn(seeker);
        when(companyMapper.findById(openJob.getCompanyId())).thenReturn(null);
        when(jobMapper.findById(openJob.getId())).thenReturn(openJob);

        ApplicationResponseDTO result = applicationService.apply(openJob.getId(), seeker.getId(), applyDTO);

        assertThat(result).isNotNull();
        assertThat(result.getJobId()).isEqualTo(openJob.getId());
        assertThat(result.getSeekerId()).isEqualTo(seeker.getId());

        verify(applicationMapper, times(1)).insert(any(Application.class));
        verify(notificationService, times(1)).create(
                eq(openJob.getPostedBy()), eq("NEW_APPLICATION"), any());
    }

    @Test
    void apply_jobNotFound_throwsResourceNotFoundException() {
        when(jobMapper.findById(99L)).thenReturn(null);

        assertThatThrownBy(() -> applicationService.apply(99L, seeker.getId(), applyDTO))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");

        verify(applicationMapper, never()).insert(any());
    }

    @Test
    void apply_duplicateApplication_throwsConflictException() {
        when(jobMapper.findById(openJob.getId())).thenReturn(openJob);
        when(applicationMapper.existsByJobAndSeeker(openJob.getId(), seeker.getId())).thenReturn(true);

        assertThatThrownBy(() -> applicationService.apply(openJob.getId(), seeker.getId(), applyDTO))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("Already applied");

        verify(applicationMapper, never()).insert(any());
    }

    @Test
    void apply_jobNotOpen_throwsValidationException() {
        Job closedJob = Job.builder()
                .id(10L)
                .title("Old Role")
                .postedBy(99L)
                .status(JobStatus.CLOSED)
                .build();

        when(jobMapper.findById(closedJob.getId())).thenReturn(closedJob);

        assertThatThrownBy(() -> applicationService.apply(closedJob.getId(), seeker.getId(), applyDTO))
                .isInstanceOf(com.jobplus.exception.ValidationException.class);

        verify(applicationMapper, never()).insert(any());
    }

    // ── updateStatus() ────────────────────────────────────────────────────────

    @Test
    void updateStatus_happyPath_callsMapperAndCreatesNotification() {
        Long applicationId = 50L;
        Long employerUserId = openJob.getPostedBy();
        Application app = Application.builder()
                .id(applicationId)
                .jobId(openJob.getId())
                .seekerId(seeker.getId())
                .status(ApplicationStatus.APPLIED)
                .build();

        // updateStatus returns 1 meaning the row was owned by this employer
        when(applicationMapper.updateStatus(applicationId, "ACCEPTED", employerUserId)).thenReturn(1);
        when(applicationMapper.findById(applicationId)).thenReturn(app);
        when(jobMapper.findById(openJob.getId())).thenReturn(openJob);
        when(userMapper.findById(seeker.getId())).thenReturn(seeker);
        when(companyMapper.findById(openJob.getCompanyId())).thenReturn(null);

        ApplicationResponseDTO result = applicationService.updateStatus(applicationId, "ACCEPTED", employerUserId);

        assertThat(result).isNotNull();
        verify(applicationMapper, times(1)).updateStatus(applicationId, "ACCEPTED", employerUserId);
        verify(notificationService, times(1)).create(
                eq(seeker.getId()), eq("APPLICATION_STATUS_UPDATED"), any());
    }

    @Test
    void updateStatus_notJobOwner_throwsForbiddenException() {
        Long applicationId = 50L;
        Long wrongEmployer = 777L;

        // updateStatus returns 0 when caller is not the job owner
        when(applicationMapper.updateStatus(applicationId, "REJECTED", wrongEmployer)).thenReturn(0);

        assertThatThrownBy(() -> applicationService.updateStatus(applicationId, "REJECTED", wrongEmployer))
                .isInstanceOf(ForbiddenException.class);

        verify(notificationService, never()).create(anyLong(), anyString(), any());
    }
}
