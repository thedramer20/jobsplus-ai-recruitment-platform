import { create } from 'zustand'

type Theme = 'light' | 'dark' | 'system'
type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  id: string
  message: string
  type: ToastType
}

const THEME_KEY = 'jobplus_theme'

function applyTheme(theme: Theme): void {
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.classList.toggle('dark', isDark)
}

const savedTheme = (localStorage.getItem(THEME_KEY) as Theme | null) ?? 'system'
applyTheme(savedTheme)

interface UIState {
  theme: Theme
  sidebarOpen: boolean
  chatbotOpen: boolean
  notificationsOpen: boolean
  toasts: Toast[]
  routeTransition: boolean
  setTheme: (theme: Theme) => void
  toggleSidebar: () => void
  openChatbot: () => void
  closeChatbot: () => void
  toggleNotifications: () => void
  closeNotifications: () => void
  addToast: (message: string, type: ToastType) => void
  removeToast: (id: string) => void
  triggerRouteTransition: (callback: () => void) => void
  endRouteTransition: () => void
}

export const useUIStore = create<UIState>((set, get) => ({
  theme: savedTheme,
  sidebarOpen: false,
  chatbotOpen: false,
  notificationsOpen: false,
  toasts: [],
  routeTransition: false,

  setTheme: (theme) => {
    localStorage.setItem(THEME_KEY, theme)
    applyTheme(theme)
    set({ theme })
  },

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  openChatbot: () => set({ chatbotOpen: true }),

  closeChatbot: () => set({ chatbotOpen: false }),

  toggleNotifications: () => set((state) => ({ notificationsOpen: !state.notificationsOpen })),

  closeNotifications: () => set({ notificationsOpen: false }),

  addToast: (message, type) => {
    const id = crypto.randomUUID()
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }))
    setTimeout(() => get().removeToast(id), 4000)
  },

  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  triggerRouteTransition: (callback) => {
    set({ routeTransition: true })
    setTimeout(callback, 800)
  },

  endRouteTransition: () => set({ routeTransition: false }),
}))
