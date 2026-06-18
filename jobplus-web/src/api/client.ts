import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'

interface RetryableConfig extends AxiosRequestConfig {
  _retry?: boolean
}

const TOKEN_KEY = 'jobplus_token'
const REFRESH_KEY = 'jobplus_refresh_token'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Queue of callbacks waiting for a token refresh to complete
let isRefreshing = false
let refreshSubscribers: ((token: string) => void)[] = []

function notifySubscribers(token: string) {
  refreshSubscribers.forEach((cb) => cb(token))
  refreshSubscribers = []
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as RetryableConfig
    const url: string = original?.url ?? ''

    if (
      error.response?.status === 401 &&
      !url.includes('/auth/refresh') &&
      !url.includes('/auth/login') &&
      !original._retry
    ) {
      const storedRefresh = localStorage.getItem(REFRESH_KEY)

      if (!storedRefresh) {
        setAuthToken(null)
        setRefreshToken(null)
        window.location.href = '/login'
        return Promise.reject(error)
      }

      // If already refreshing, queue this request until done
      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshSubscribers.push((token) => {
            if (original.headers) original.headers.Authorization = `Bearer ${token}`
            resolve(apiClient(original))
          })
        })
      }

      original._retry = true
      isRefreshing = true

      try {
        const baseURL = import.meta.env.VITE_API_BASE_URL as string
        const res = await axios.post(`${baseURL}/auth/refresh`, { refreshToken: storedRefresh })
        const data = res.data.data as { accessToken: string; refreshToken: string }

        setAuthToken(data.accessToken)
        setRefreshToken(data.refreshToken)
        notifySubscribers(data.accessToken)

        if (original.headers) original.headers.Authorization = `Bearer ${data.accessToken}`
        return apiClient(original)
      } catch {
        setAuthToken(null)
        setRefreshToken(null)
        window.location.href = '/login'
        return Promise.reject(error)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export const setAuthToken = (token: string | null): void => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

export const setRefreshToken = (token: string | null): void => {
  if (token) {
    localStorage.setItem(REFRESH_KEY, token)
  } else {
    localStorage.removeItem(REFRESH_KEY)
  }
}

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.error?.message ??
      error.response?.data?.message ??
      error.message
    )
  }
  if (error instanceof Error) return error.message
  return 'Something went wrong'
}

export default apiClient
