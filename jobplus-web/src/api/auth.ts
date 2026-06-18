import apiClient from './client'
import type { ApiResponse, User } from '@/types'

export interface RegisterRequest {
  name: string
  email: string
  password: string
  role: 'JOB_SEEKER' | 'EMPLOYER'
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  user: User
}

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data)
  return res.data.data
}

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data)
  return res.data.data
}

export async function refreshToken(data: RefreshTokenRequest): Promise<AuthResponse> {
  const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/refresh', data)
  return res.data.data
}

export async function logout(token: string): Promise<void> {
  await apiClient.post('/auth/logout', null, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function changePassword(data: {
  currentPassword: string
  newPassword: string
}): Promise<void> {
  await apiClient.patch<ApiResponse<null>>('/auth/change-password', data)
}

// Resolves to a reset URL only in local/dev (when the backend has email disabled);
// null in production, where a real email is sent instead.
export async function requestPasswordReset(data: { email: string }): Promise<string | null> {
  const res = await apiClient.post<ApiResponse<string | null>>('/auth/forgot-password', data)
  return res.data.data ?? null
}

export async function resetPassword(data: {
  token: string
  newPassword: string
}): Promise<void> {
  await apiClient.post<ApiResponse<null>>('/auth/reset-password', data)
}

export async function changeEmail(data: {
  currentPassword: string
  newEmail: string
}): Promise<AuthResponse> {
  const res = await apiClient.patch<ApiResponse<AuthResponse>>('/auth/change-email', data)
  return res.data.data
}
