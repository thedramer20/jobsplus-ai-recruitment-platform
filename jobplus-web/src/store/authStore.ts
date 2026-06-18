import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { type User } from '@/types'
import { setAuthToken, setRefreshToken } from '@/api/client'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User, accessToken: string, refreshToken?: string) => void
  patchUser: (fields: Partial<User>) => void
  clearAuth: () => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user, accessToken, refreshToken) => {
        setAuthToken(accessToken)
        if (refreshToken) setRefreshToken(refreshToken)
        set({ user, accessToken, refreshToken: refreshToken ?? null, isAuthenticated: true })
      },

      patchUser: (fields) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...fields } : state.user,
        })),

      clearAuth: () => {
        setAuthToken(null)
        setRefreshToken(null)
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false })
      },

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'jobplus-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken) setAuthToken(state.accessToken)
        if (state?.refreshToken) setRefreshToken(state.refreshToken)
      },
    }
  )
)
