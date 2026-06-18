import apiClient from './client'
import type { PaginatedResponse, ApiResponse, Company, Job } from '@/types'

export interface CompanyFilterParams {
  industry?: string
  size?: string
  location?: string
  verified?: boolean
  page?: number
  pageSize?: number
}

export interface CreateCompanyDTO {
  name: string
  logoUrl?: string
  industry?: string
  size?: string
  location?: string
  website?: string
  description?: string
}

export const getCompanies = (params: CompanyFilterParams) =>
  apiClient
    .get<ApiResponse<PaginatedResponse<Company>>>('/companies', { params })
    .then((r) => r.data.data)

export const getCompanyById = (id: number) =>
  apiClient.get<ApiResponse<Company>>(`/companies/${id}`).then((r) => r.data.data)

export const createCompany = (data: CreateCompanyDTO) =>
  apiClient.post<ApiResponse<Company>>('/companies', data).then((r) => r.data.data)

export const updateCompany = (id: number, data: CreateCompanyDTO) =>
  apiClient.put<ApiResponse<Company>>(`/companies/${id}`, data).then((r) => r.data.data)

export const getMyCompany = () =>
  apiClient.get<ApiResponse<Company | null>>('/companies/me').then((r) => r.data.data)

export const getCompanyJobs = (id: number, page = 0) =>
  apiClient
    .get<ApiResponse<PaginatedResponse<Job>>>(`/companies/${id}/jobs`, { params: { page } })
    .then((r) => r.data.data)
