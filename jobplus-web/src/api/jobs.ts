import apiClient from './client'
import type { PaginatedResponse, ApiResponse, Job, Application } from '@/types'

export interface JobFilterParams {
  keyword?: string
  location?: string
  employmentType?: string
  experienceLevel?: string
  salaryMin?: number
  salaryMax?: number
  remote?: boolean
  companyId?: number
  postedWithinDays?: number
  skillIds?: number[]
  page?: number
  size?: number
}

export interface CreateJobDTO {
  title: string
  description: string
  employmentType: string
  experienceLevel: string
  location?: string
  salaryMin?: number
  salaryMax?: number
  deadline?: string
  skillIds?: number[]
}

export interface UpdateJobDTO extends Partial<CreateJobDTO> {
  status?: string
}

export interface ApplyJobDTO {
  coverLetter?: string
  resumeUrl?: string
}

export const getJobs = (params: JobFilterParams) =>
  apiClient
    .get<ApiResponse<PaginatedResponse<Job>>>('/jobs', { params })
    .then((r) => r.data.data)

export const getJobById = (id: number) =>
  apiClient.get<ApiResponse<Job>>(`/jobs/${id}`).then((r) => r.data.data)

export const createJob = (data: CreateJobDTO) =>
  apiClient.post<ApiResponse<Job>>('/jobs', data).then((r) => r.data.data)

export const updateJob = (id: number, data: UpdateJobDTO) =>
  apiClient.put<ApiResponse<Job>>(`/jobs/${id}`, data).then((r) => r.data.data)

export const deleteJob = (id: number) =>
  apiClient.delete<ApiResponse<null>>(`/jobs/${id}`)

export const saveJob = (id: number) =>
  apiClient.post<ApiResponse<null>>(`/jobs/${id}/save`)

export const unsaveJob = (id: number) =>
  apiClient.delete<ApiResponse<null>>(`/jobs/${id}/save`)

export const getSavedJobs = (page = 0) =>
  apiClient
    .get<ApiResponse<PaginatedResponse<Job>>>('/jobs/saved', { params: { page } })
    .then((r) => r.data.data)

export const applyToJob = (id: number, data: ApplyJobDTO) =>
  apiClient
    .post<ApiResponse<Application>>(`/jobs/${id}/apply`, data)
    .then((r) => r.data.data)

export const getMyApplications = (page = 0) =>
  apiClient
    .get<ApiResponse<PaginatedResponse<Application>>>('/applications/me', { params: { page } })
    .then((r) => r.data.data)

export const getJobApplicants = (jobId: number, page = 0) =>
  apiClient
    .get<ApiResponse<PaginatedResponse<Application>>>(`/jobs/${jobId}/applicants`, {
      params: { page },
    })
    .then((r) => r.data.data)

export const updateApplicationStatus = (appId: number, status: string) =>
  apiClient
    .patch<ApiResponse<Application>>(`/applications/${appId}/status`, { status })
    .then((r) => r.data.data)
