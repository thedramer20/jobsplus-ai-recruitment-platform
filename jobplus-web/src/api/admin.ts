import api from '@/api/client'
import type { User, Company, Job, Post, PaginatedResponse } from '@/types'

export interface AdminStats {
  totalUsers: number
  totalSeekers: number
  totalEmployers: number
  totalJobs: number
  openJobs: number
  totalApplications: number
  totalCompanies: number
  newUsersLast30Days: number
  signupsLast30Days: Array<{ date: string; count: number }>
  applicationsByStatus: Array<{ status: string; count: number }>
}

export interface AuditLogEntry {
  id: number
  adminId: number
  adminName: string
  action: string
  targetType: string | null
  targetId: number | null
  detail: string | null
  createdAt: string
}

export async function getStats(): Promise<AdminStats> {
  const res = await api.get<{ data: AdminStats }>('/admin/stats')
  return res.data.data
}

export async function getUsers(params: {
  role?: string
  status?: string
  search?: string
  page?: number
  size?: number
}): Promise<PaginatedResponse<User>> {
  const res = await api.get<{ data: PaginatedResponse<User> }>('/admin/users', { params })
  return res.data.data
}

export async function updateUserStatus(id: number, status: string): Promise<void> {
  await api.patch(`/admin/users/${id}/status`, { status })
}

export async function updateUserRole(id: number, role: string): Promise<void> {
  await api.patch(`/admin/users/${id}/role`, { role })
}

export async function deleteUser(id: number): Promise<void> {
  await api.delete(`/admin/users/${id}`)
}

export async function getCompanies(params: {
  verified?: boolean
  search?: string
  page?: number
  size?: number
}): Promise<PaginatedResponse<Company>> {
  const res = await api.get<{ data: PaginatedResponse<Company> }>('/admin/companies', { params })
  return res.data.data
}

export async function setCompanyVerified(id: number, verified: boolean): Promise<void> {
  await api.patch(`/admin/companies/${id}/verify`, { verified })
}

export async function getJobs(params: {
  status?: string
  search?: string
  page?: number
  size?: number
}): Promise<PaginatedResponse<Job>> {
  const res = await api.get<{ data: PaginatedResponse<Job> }>('/admin/jobs', { params })
  return res.data.data
}

export async function updateJobStatus(id: number, status: string): Promise<void> {
  await api.patch(`/admin/jobs/${id}/status`, { status })
}

export async function deleteJob(id: number): Promise<void> {
  await api.delete(`/admin/jobs/${id}`)
}

export async function getPosts(params: {
  page?: number
  size?: number
}): Promise<PaginatedResponse<Post>> {
  const res = await api.get<{ data: PaginatedResponse<Post> }>('/admin/posts', { params })
  return res.data.data
}

export async function deletePost(id: number): Promise<void> {
  await api.delete(`/admin/posts/${id}`)
}

export async function getAuditLog(params: {
  page?: number
  size?: number
}): Promise<PaginatedResponse<AuditLogEntry>> {
  const res = await api.get<{ data: PaginatedResponse<AuditLogEntry> }>('/admin/audit-log', { params })
  return res.data.data
}
