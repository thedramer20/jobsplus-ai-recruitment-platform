import type { JobFilterParams } from '@/api/jobs'

export const jobKeys = {
  all: ['jobs'] as const,
  lists: () => [...jobKeys.all, 'list'] as const,
  list: (params: JobFilterParams) => [...jobKeys.lists(), params] as const,
  detail: (id: number) => [...jobKeys.all, 'detail', id] as const,
  saved: (page: number) => [...jobKeys.all, 'saved', page] as const,
  applicants: (jobId: number, page: number) => [...jobKeys.all, 'applicants', jobId, page] as const,
  myApplications: (page: number) => ['applications', 'me', page] as const,
}
