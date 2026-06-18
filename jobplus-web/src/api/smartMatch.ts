import apiClient from './client'
import type {
  ApiResponse,
  PaginatedResponse,
  SmartMatchedCandidate,
  SmartMatchedJob,
  SmartMatchResult,
} from '@/types'
import type { JobFilterParams } from './jobs'

export const getSmartMatchForJob = (jobId: number): Promise<SmartMatchResult> =>
  apiClient
    .get<ApiResponse<SmartMatchResult>>(`/smart-match/jobs/${jobId}`)
    .then((r) => r.data.data)

export const getSmartMatchJobs = (params: JobFilterParams): Promise<PaginatedResponse<SmartMatchedJob>> =>
  apiClient
    .get<ApiResponse<PaginatedResponse<SmartMatchedJob>>>('/smart-match/jobs/recommendations', { params })
    .then((r) => r.data.data)

export const getSmartMatchCandidates = (
  jobId: number,
  page = 0,
  size = 20,
): Promise<PaginatedResponse<SmartMatchedCandidate>> =>
  apiClient
    .get<ApiResponse<PaginatedResponse<SmartMatchedCandidate>>>(`/smart-match/jobs/${jobId}/candidates`, {
      params: { page, size },
    })
    .then((r) => r.data.data)
