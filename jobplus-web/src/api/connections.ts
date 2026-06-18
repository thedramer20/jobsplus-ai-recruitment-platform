import apiClient from './client'
import type { ApiResponse, User } from '@/types'

export interface ConnectionResponse {
  id: number
  otherUser: User
  status: string
  createdAt: string
}

export const getMyConnections = (): Promise<ConnectionResponse[]> =>
  apiClient
    .get<ApiResponse<ConnectionResponse[]>>('/connections')
    .then((r) => r.data.data)

export const getIncomingRequests = (): Promise<ConnectionResponse[]> =>
  apiClient
    .get<ApiResponse<ConnectionResponse[]>>('/connections/requests')
    .then((r) => r.data.data)

export const getSuggestions = (limit = 20): Promise<User[]> =>
  apiClient
    .get<ApiResponse<User[]>>('/connections/suggestions', { params: { limit } })
    .then((r) => r.data.data)

export const sendRequest = (userId: number): Promise<ConnectionResponse> =>
  apiClient
    .post<ApiResponse<ConnectionResponse>>(`/connections/request/${userId}`)
    .then((r) => r.data.data)

export const acceptRequest = (id: number): Promise<ConnectionResponse> =>
  apiClient
    .patch<ApiResponse<ConnectionResponse>>(`/connections/${id}/accept`)
    .then((r) => r.data.data)

export const rejectRequest = (id: number): Promise<void> =>
  apiClient
    .patch<ApiResponse<null>>(`/connections/${id}/reject`)
    .then(() => undefined)

export const removeConnection = (id: number): Promise<void> =>
  apiClient
    .delete<ApiResponse<null>>(`/connections/${id}`)
    .then(() => undefined)

export const cancelRequest = (userId: number): Promise<void> =>
  apiClient
    .delete<ApiResponse<null>>(`/connections/request/${userId}`)
    .then(() => undefined)

export const getConnectionStatus = (userId: number): Promise<string> =>
  apiClient
    .get<ApiResponse<string>>(`/connections/status/${userId}`)
    .then((r) => r.data.data)
