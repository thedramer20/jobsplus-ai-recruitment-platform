import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { router } from '@/routes/router'
import { useUIStore } from '@/store/uiStore'
import { AppTransitionOverlay } from '@/components/ui/AppTransitionOverlay'
import '@/styles/globals.css'

function SuccessIcon() {
  return (
    <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  )
}

function ErrorIcon() {
  return (
    <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function ToastContainer() {
  const { toasts, removeToast } = useUIStore()

  const toastConfig = {
    success: { bg: 'bg-emerald-600',         Icon: SuccessIcon },
    error:   { bg: 'bg-red-600',             Icon: ErrorIcon   },
    info:    { bg: 'bg-indigo-600',           Icon: InfoIcon    },
  }

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const { bg, Icon } = toastConfig[toast.type]
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 60, scale: 0.92 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 420, damping: 30 }}
              className={`flex min-w-[260px] max-w-[380px] items-center gap-3 rounded-xl px-4 py-3 shadow-xl ${bg}`}
            >
              <div className="flex-shrink-0 text-white/90">
                <Icon />
              </div>
              <span className="flex-1 text-sm font-medium text-white leading-snug">
                {toast.message}
              </span>
              <button
                type="button"
                aria-label="Close notification"
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 rounded p-0.5 text-white/60 transition hover:text-white"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

export default function App() {
  const theme = useUIStore((s) => s.theme)

  useEffect(() => {
    const isDark =
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    document.documentElement.classList.toggle('dark', isDark)
  }, [theme])

  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer />
      <AppTransitionOverlay />
    </>
  )
}
