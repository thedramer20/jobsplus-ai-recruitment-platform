import apiClient from './client'
import type { ApiResponse, PaginatedResponse, Post, User } from '@/types'

export interface CreatePostData {
  content: string
  mediaUrl?: string
}

export interface PostComment {
  id: number
  author: User
  content: string
  createdAt: string
}

export const getFeed = (page = 0, size = 20): Promise<PaginatedResponse<Post>> =>
  apiClient
    .get<ApiResponse<PaginatedResponse<Post>>>('/posts/feed', { params: { page, size } })
    .then((r) => r.data.data)

export const getTrending = (page = 0, size = 20): Promise<PaginatedResponse<Post>> =>
  apiClient
    .get<ApiResponse<PaginatedResponse<Post>>>('/posts/trending', { params: { page, size } })
    .then((r) => r.data.data)

export const createPost = (data: CreatePostData): Promise<Post> =>
  apiClient
    .post<ApiResponse<Post>>('/posts', data)
    .then((r) => r.data.data)

export const uploadPostMedia = (file: File): Promise<string> => {
  const formData = new FormData()
  formData.append('file', file)

  return apiClient
    .post<ApiResponse<string>>('/posts/media', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data.data)
}

export const deletePost = (id: number): Promise<void> =>
  apiClient.delete<ApiResponse<null>>(`/posts/${id}`).then(() => undefined)

export const likePost = (id: number): Promise<void> =>
  apiClient.post<ApiResponse<null>>(`/posts/${id}/like`).then(() => undefined)

export const unlikePost = (id: number): Promise<void> =>
  apiClient.delete<ApiResponse<null>>(`/posts/${id}/like`).then(() => undefined)

export const getComments = (postId: number): Promise<PostComment[]> =>
  apiClient
    .get<ApiResponse<PostComment[]>>(`/posts/${postId}/comments`)
    .then((r) => r.data.data)

export const addComment = (postId: number, content: string): Promise<PostComment> =>
  apiClient
    .post<ApiResponse<PostComment>>(`/posts/${postId}/comments`, { content })
    .then((r) => r.data.data)

export const getUserPosts = (userId: number, page = 0, size = 10): Promise<PaginatedResponse<Post>> =>
  apiClient
    .get<ApiResponse<PaginatedResponse<Post>>>(`/posts/user/${userId}`, { params: { page, size } })
    .then((r) => r.data.data)
