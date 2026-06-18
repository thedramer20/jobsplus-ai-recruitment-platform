import apiClient from './client'
import type { ApiResponse } from '@/types'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SkillItem {
  id: number
  name: string
}

export interface ExperienceItem {
  id: number
  userId: number
  title: string
  companyName: string
  location: string | null
  startDate: string | null
  endDate: string | null
  current: boolean | null
  description: string | null
  createdAt: string
}

export interface EducationItem {
  id: number
  userId: number
  school: string
  degree: string | null
  fieldOfStudy: string | null
  startYear: number | null
  endYear: number | null
  createdAt: string
}

export interface ProfileData {
  id: number
  email: string
  name: string
  headline: string | null
  avatarUrl: string | null
  location: string | null
  role: string
  bio: string | null
  yearsExperience: number | null
  educationSummary: string | null
  resumeUrl: string | null
  openToWork: boolean | null
  bannerGradient: string | null
  experiences: ExperienceItem[]
  educations: EducationItem[]
  skills: SkillItem[]
}

export type ExperiencePayload = Omit<ExperienceItem, 'id' | 'userId' | 'createdAt'>
export type EducationPayload = Omit<EducationItem, 'id' | 'userId' | 'createdAt'>

// ── Profile ───────────────────────────────────────────────────────────────────

export const getProfile = (userId: number): Promise<ProfileData> =>
  apiClient
    .get<ApiResponse<ProfileData>>(`/profiles/${userId}`)
    .then((r) => r.data.data)

export const updateUser = (data: {
  name?: string
  headline?: string
  location?: string
  avatarUrl?: string
}): Promise<unknown> =>
  apiClient.put<ApiResponse<unknown>>('/users/me', data).then((r) => r.data.data)

export const updateProfile = (data: {
  bio?: string
  yearsExperience?: number
  openToWork?: boolean
  resumeUrl?: string
}): Promise<ProfileData> =>
  apiClient.put<ApiResponse<ProfileData>>('/profiles/me', data).then((r) => r.data.data)

// ── Experience ────────────────────────────────────────────────────────────────

export const addExperience = (data: ExperiencePayload): Promise<ExperienceItem> =>
  apiClient
    .post<ApiResponse<ExperienceItem>>('/profiles/me/experience', data)
    .then((r) => r.data.data)

export const updateExperience = (id: number, data: ExperiencePayload): Promise<ExperienceItem> =>
  apiClient
    .put<ApiResponse<ExperienceItem>>(`/profiles/me/experience/${id}`, data)
    .then((r) => r.data.data)

export const deleteExperience = (id: number): Promise<void> =>
  apiClient.delete<ApiResponse<null>>(`/profiles/me/experience/${id}`).then(() => undefined)

// ── Education ─────────────────────────────────────────────────────────────────

export const addEducation = (data: EducationPayload): Promise<EducationItem> =>
  apiClient
    .post<ApiResponse<EducationItem>>('/profiles/me/education', data)
    .then((r) => r.data.data)

export const updateEducation = (id: number, data: EducationPayload): Promise<EducationItem> =>
  apiClient
    .put<ApiResponse<EducationItem>>(`/profiles/me/education/${id}`, data)
    .then((r) => r.data.data)

export const deleteEducation = (id: number): Promise<void> =>
  apiClient.delete<ApiResponse<null>>(`/profiles/me/education/${id}`).then(() => undefined)

// ── Skills ────────────────────────────────────────────────────────────────────

export const getMySkills = (): Promise<SkillItem[]> =>
  apiClient
    .get<ApiResponse<SkillItem[]>>('/profiles/me/skills')
    .then((r) => r.data.data)

export const addSkill = (skillId: number): Promise<void> =>
  apiClient
    .post<ApiResponse<null>>(`/profiles/me/skills/${skillId}`)
    .then(() => undefined)

export const createSkill = (name: string): Promise<SkillItem> =>
  apiClient
    .post<ApiResponse<SkillItem>>('/profiles/me/skills', { name })
    .then((r) => r.data.data)

export const removeSkill = (skillId: number): Promise<void> =>
  apiClient
    .delete<ApiResponse<null>>(`/profiles/me/skills/${skillId}`)
    .then(() => undefined)

export const getAllSkills = (): Promise<SkillItem[]> =>
  apiClient.get<ApiResponse<SkillItem[]>>('/skills').then((r) => r.data.data)

export const updateBannerGradient = (bannerGradient: string): Promise<void> =>
  apiClient.patch<ApiResponse<null>>('/profiles/me', { bannerGradient }).then(() => undefined)

export async function uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
  const formData = new FormData()
  formData.append('avatar', file)
  const res = await apiClient.post<ApiResponse<string>>('/users/me/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return { avatarUrl: res.data.data }
}

export async function uploadResume(file: File): Promise<{ resumeUrl: string }> {
  const formData = new FormData()
  formData.append('resume', file)
  const res = await apiClient.post<ApiResponse<string>>('/users/me/resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return { resumeUrl: res.data.data }
}
