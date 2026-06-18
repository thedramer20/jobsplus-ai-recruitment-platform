import apiClient from './client'
import type { ApiResponse } from '@/types'

export type Visibility = 'public' | 'connections' | 'private'
export type MessagingPref = 'everyone' | 'connections' | 'nobody'

export interface UserSettings {
  privacy: {
    visibility: Visibility
    messaging: MessagingPref
    showInSearch: boolean
    showConnections: boolean
  }
  notifications: {
    email: {
      connections: boolean
      messages: boolean
      jobMatches: boolean
      applicationUpdates: boolean
      companyUpdates: boolean
      weeklyDigest: boolean
    }
    push: {
      connections: boolean
      messages: boolean
      jobMatches: boolean
    }
  }
}

export const DEFAULT_SETTINGS: UserSettings = {
  privacy: {
    visibility: 'public',
    messaging: 'everyone',
    showInSearch: true,
    showConnections: true,
  },
  notifications: {
    email: {
      connections: true,
      messages: true,
      jobMatches: true,
      applicationUpdates: true,
      companyUpdates: false,
      weeklyDigest: true,
    },
    push: { connections: false, messages: false, jobMatches: false },
  },
}

export const getSettings = (): Promise<Partial<UserSettings>> =>
  apiClient.get<ApiResponse<Partial<UserSettings>>>('/settings').then((r) => r.data.data ?? {})

export const updateSettings = (settings: Partial<UserSettings>): Promise<Partial<UserSettings>> =>
  apiClient.put<ApiResponse<Partial<UserSettings>>>('/settings', settings).then((r) => r.data.data ?? {})
