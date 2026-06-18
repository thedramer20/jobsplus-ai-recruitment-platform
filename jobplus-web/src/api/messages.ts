import apiClient from '@/api/client'
import type { ApiResponse } from '@/types'

export interface ConversationSummary {
  id: number
  otherUser: {
    id: number
    name: string
    avatarUrl: string | null
    headline: string | null
  }
  lastMessageContent: string | null
  lastMessageAt: string | null
  unreadCount: number
}

export interface MessageResponse {
  id: number
  conversationId: number
  senderId: number
  content: string
  readAt: string | null
  createdAt: string
}

export async function getConversations(): Promise<ConversationSummary[]> {
  const res = await apiClient.get<ApiResponse<ConversationSummary[]>>('/conversations')
  return res.data.data
}

export async function startConversation(otherUserId: number): Promise<ConversationSummary> {
  const res = await apiClient.post<ApiResponse<ConversationSummary>>('/conversations', { otherUserId })
  return res.data.data
}

export async function getMessages(
  conversationId: number,
  page = 0,
  size = 50,
): Promise<MessageResponse[]> {
  const res = await apiClient.get<ApiResponse<MessageResponse[]>>(
    `/conversations/${conversationId}/messages`,
    { params: { page, size } },
  )
  return res.data.data
}

export async function sendMessage(
  conversationId: number,
  content: string,
): Promise<MessageResponse> {
  const res = await apiClient.post<ApiResponse<MessageResponse>>(
    `/conversations/${conversationId}/messages`,
    { content },
  )
  return res.data.data
}
