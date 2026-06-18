import apiClient from '@/api/client'
import type { ApiResponse } from '@/types'

export interface NotificationResponse {
  id: number
  type: string
  payload: string // raw JSON string from backend
  readFlag: boolean
  createdAt: string
}

export interface PaginatedNotifications {
  content: NotificationResponse[]
  totalElements: number
  totalPages: number
  currentPage: number
  pageSize: number
}

export async function getNotifications(
  unreadOnly = false,
  page = 0,
  size = 50,
): Promise<PaginatedNotifications> {
  const res = await apiClient.get<ApiResponse<PaginatedNotifications>>('/notifications', {
    params: { unreadOnly, page, size },
  })
  return res.data.data
}

export async function getUnreadCount(): Promise<number> {
  const res = await apiClient.get<ApiResponse<{ count: number }>>('/notifications/unread-count')
  return res.data.data.count
}

export async function markRead(id: number): Promise<void> {
  await apiClient.patch(`/notifications/${id}/read`)
}

export async function markAllRead(): Promise<void> {
  await apiClient.patch('/notifications/read-all')
}
