import { useRef, useEffect } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, Users, MessageCircle, X } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import {
  getNotifications,
  markRead,
  markAllRead,
  type NotificationResponse,
} from '@/api/notifications'

// ── helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function getIcon(type: string): JSX.Element {
  if (type.includes('CONNECTION')) return <Users className="h-4 w-4 text-blue-500" />
  if (type.includes('MESSAGE')) return <MessageCircle className="h-4 w-4 text-green-500" />
  return <Bell className="h-4 w-4 text-primary" />
}

function parsePayload(payload: string): Record<string, string> {
  try {
    return JSON.parse(payload) as Record<string, string>
  } catch {
    return {}
  }
}

function getNotifText(type: string, payload: string): string {
  const p = parsePayload(payload)
  switch (type) {
    case 'NEW_APPLICATION':
      return `${p.seekerName ?? 'Someone'} applied for "${p.jobTitle ?? 'a job'}"`
    case 'APPLICATION_STATUS_UPDATED':
      return `Your application for "${p.jobTitle ?? 'a job'}" is now ${p.status ?? 'updated'}`
    case 'CONNECTION_REQUEST':
      return `${p.requesterName ?? 'Someone'} sent you a connection request`
    case 'CONNECTION_ACCEPTED':
      return `${p.acceptorName ?? 'Someone'} accepted your connection request`
    case 'MESSAGE_RECEIVED':
      return `${p.senderName ?? 'Someone'} sent you a message`
    case 'JOB_POSTED':
      return p.message ?? 'A new job matches your profile'
    default:
      return p.message ?? type.replace(/_/g, ' ').toLowerCase()
  }
}


function groupByDate(
  items: NotificationResponse[],
): { label: string; items: NotificationResponse[] }[] {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekAgo = new Date(today.getTime() - 6 * 86400000)

  const groups: Record<string, NotificationResponse[]> = {
    Today: [],
    'This Week': [],
    Earlier: [],
  }

  for (const item of items) {
    const d = new Date(item.createdAt)
    if (d >= today) groups.Today.push(item)
    else if (d >= weekAgo) groups['This Week'].push(item)
    else groups.Earlier.push(item)
  }

  return Object.entries(groups)
    .filter(([, v]) => v.length > 0)
    .map(([label, items]) => ({ label, items }))
}

// ── skeleton ──────────────────────────────────────────────────────────────────

function NotifSkeleton() {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <div className="mt-1 h-2 w-2 flex-shrink-0 animate-pulse rounded-full bg-slate-200 dark:bg-white/10" />
      <div className="h-8 w-8 flex-shrink-0 animate-pulse rounded-full bg-slate-200 dark:bg-white/10" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-white/10" />
        <div className="h-2.5 w-1/3 animate-pulse rounded bg-slate-200 dark:bg-white/10" />
      </div>
    </div>
  )
}

// ── item ──────────────────────────────────────────────────────────────────────

const listItemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
}

interface NotifItemProps {
  item: NotificationResponse
  onRead: (id: number) => void
  onClose: () => void
  prefersReducedMotion: boolean | null
}

function NotifItem({ item, onRead, onClose, prefersReducedMotion }: NotifItemProps) {
  return (
    <motion.button
      variants={prefersReducedMotion ? undefined : listItemVariants}
      onClick={() => {
        if (!item.readFlag) onRead(item.id)
        onClose()
      }}
      className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-slate-50 dark:hover:bg-white/5"
    >
      <div className="mt-1.5 flex-shrink-0">
        {item.readFlag ? (
          <div className="h-2 w-2" />
        ) : (
          <div className="h-2 w-2 rounded-full bg-blue-500" />
        )}
      </div>
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-white/10">
        {getIcon(item.type)}
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={`text-sm leading-snug ${
            item.readFlag
              ? 'text-slate-500 dark:text-slate-400'
              : 'font-medium text-slate-900 dark:text-white'
          }`}
        >
          {getNotifText(item.type, item.payload)}
        </p>
        <p className="mt-0.5 text-xs text-slate-400">{timeAgo(item.createdAt)}</p>
      </div>
    </motion.button>
  )
}

// ── drawer ────────────────────────────────────────────────────────────────────

const listContainerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}

export default function NotificationsDrawer() {
  const { notificationsOpen, closeNotifications } = useUIStore()
  const prefersReducedMotion = useReducedMotion()
  const queryClient = useQueryClient()
  const panelRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeNotifications()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [closeNotifications])

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => getNotifications(false, 0, 50),
    refetchInterval: 30000,
    enabled: notificationsOpen,
  })

  const markReadMutation = useMutation({
    mutationFn: markRead,
    onSuccess: (_data, id) => {
      queryClient.setQueryData<Awaited<ReturnType<typeof getNotifications>>>(
        ['notifications'],
        (old) => {
          if (!old) return old
          return {
            ...old,
            content: old.content.map((n) => (n.id === id ? { ...n, readFlag: true } : n)),
          }
        },
      )
      void queryClient.invalidateQueries({ queryKey: ['unread-count'] })
    },
  })

  const markAllMutation = useMutation({
    mutationFn: markAllRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] })
      void queryClient.invalidateQueries({ queryKey: ['unread-count'] })
    },
  })

  const notifications = data?.content ?? []
  const groups = groupByDate(notifications)
  const hasUnread = notifications.some((n) => !n.readFlag)

  function handleRead(id: number) {
    markReadMutation.mutate(id)
  }

  function handleMarkAllRead() {
    markAllMutation.mutate()
  }

  return (
    <AnimatePresence>
      {notificationsOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={closeNotifications}
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={prefersReducedMotion ? {} : { opacity: 1 }}
            exit={prefersReducedMotion ? {} : { opacity: 0 }}
          />

          {/* Drawer panel */}
          <motion.div
            ref={panelRef}
            className="fixed right-0 top-0 z-50 flex h-full w-80 max-w-[90vw] flex-col bg-white shadow-2xl dark:bg-slate-900"
            initial={prefersReducedMotion ? false : { x: '100%' }}
            animate={prefersReducedMotion ? {} : { x: 0 }}
            exit={prefersReducedMotion ? {} : { x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 dark:border-white/10">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Notifications
              </h2>
              <div className="flex items-center gap-2">
                {hasUnread && (
                  <motion.button
                    onClick={handleMarkAllRead}
                    disabled={markAllMutation.isPending}
                    whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
                    className="text-xs font-medium text-primary hover:underline disabled:opacity-50"
                  >
                    Mark all read
                  </motion.button>
                )}
                <motion.button
                  onClick={closeNotifications}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  <X className="h-4 w-4" />
                </motion.button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => <NotifSkeleton key={i} />)
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                  <Bell className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                  <p className="text-sm text-slate-400">No notifications yet</p>
                </div>
              ) : (
                groups.map(({ label, items }) => (
                  <div key={label}>
                    <p className="sticky top-0 bg-slate-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:bg-slate-800/80 dark:text-slate-500">
                      {label}
                    </p>
                    <motion.div
                      variants={prefersReducedMotion ? undefined : listContainerVariants}
                      initial="hidden"
                      animate="show"
                    >
                      {items.map((item) => (
                        <NotifItem
                          key={item.id}
                          item={item}
                          onRead={handleRead}
                          onClose={closeNotifications}
                          prefersReducedMotion={prefersReducedMotion}
                        />
                      ))}
                    </motion.div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
