import type { CompanyFilterParams } from '@/api/companies'

export const companyKeys = {
  all: ['companies'] as const,
  lists: () => [...companyKeys.all, 'list'] as const,
  list: (params: CompanyFilterParams) => [...companyKeys.lists(), params] as const,
  detail: (id: number) => [...companyKeys.all, 'detail', id] as const,
  jobs: (id: number, page: number) => [...companyKeys.all, 'jobs', id, page] as const,
}
