import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { PageTransition } from '@/components/layout/PageTransition'
import {
  Bell, BellOff, Check, CheckCheck, UserPlus, Briefcase,
  MessageSquare, CheckCircle,
} from 'lucide-react'
import { getNotifications, markAllRead, markRead } from '@/api/notifications'
import type { NotificationResponse } from '@/api/notifications'
import { useUIStore } from '@/store/uiStore'

// ── Demo data ─────────────────────────────────────────────────────────────────

const DEMO_NOTIFICATIONS: NotificationResponse[] = [
  { id: -1, type: 'CONNECTION_REQUEST',  payload: '{"message":"Sarah Chen sent you a connection request"}',                               readFlag: false, createdAt: new Date(Date.now() - 5 * 60000).toISOString()     },
  { id: -2, type: 'CONNECTION_ACCEPTED', payload: '{"message":"James Liu accepted your connection request"}',                             readFlag: false, createdAt: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: -3, type: 'MESSAGE_RECEIVED',    payload: '{"message":"Priya Nair sent you a message: \\"Hey! Are you open to opportunities?\\""}', readFlag: false, createdAt: new Date(Date.now() - 3 * 3600000).toISOString() },
  { id: -4, type: 'JOB_POSTED',          payload: '{"message":"New job: Senior Frontend Engineer at TechVentures matches your profile"}',  readFlag: true,  createdAt: new Date(Date.now() - 6 * 3600000).toISOString() },
  { id: -5, type: 'APPLICATION_STATUS',  payload: '{"message":"Your application to ByteForge has been reviewed by the recruiter"}',       readFlag: true,  createdAt: new Date(Date.now() - 86400000).toISOString()   },
]

// ── Config ────────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<string, {
  icon: React.ReactNode
  iconBg: string
  label: string
  defaultMsg: string
  action?: string
}> = {
  CONNECTION_REQUEST:  { icon: <UserPlus className="h-4 w-4" />,      iconBg: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400',  label: 'Connection',   defaultMsg: 'Someone wants to connect',          action: '/network'   },
  CONNECTION_ACCEPTED: { icon: <CheckCircle className="h-4 w-4" />,   iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400', label: 'Connection', defaultMsg: 'Connection request accepted',         action: '/network'   },
  MESSAGE_RECEIVED:    { icon: <MessageSquare className="h-4 w-4" />, iconBg: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',           label: 'Message',    defaultMsg: 'You have a new message',             action: '/messages'  },
  JOB_POSTED:          { icon: <Briefcase className="h-4 w-4" />,     iconBg: 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',       label: 'Job',        defaultMsg: 'A new job matches your profile',     action: '/jobs'      },
  APPLICATION_STATUS:  { icon: <Briefcase className="h-4 w-4" />,     iconBg: 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400',   label: 'Application',defaultMsg: 'Your application status was updated', action: '/jobs'      },
}

const FILTER_TABS = [
  { key: 'all',         label: 'All'         },
  { key: 'unread',      label: 'Unread'      },
  { key: 'connections', label: 'Connections' },
  { key: 'messages',    label: 'Messages'    },
  { key: 'jobs',        label: 'Jobs'        },
] as const
type FilterKey = typeof FILTER_TABS[number]['key']

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function parseMessage(n: NotificationResponse): string {
  try {
    const p = JSON.parse(n.payload) as { message?: string }
    if (p.message) return p.message
  } catch { /* fallback */ }
  return TYPE_CONFIG[n.type]?.defaultMsg ?? n.type
}

function matchesFilter(n: NotificationResponse, filter: FilterKey): boolean {
  if (filter === 'all')    return true
  if (filter === 'unread') return !n.readFlag
  if (filter === 'connections') return n.type === 'CONNECTION_REQUEST' || n.type === 'CONNECTION_ACCEPTED'
  if (filter === 'messages')    return n.type === 'MESSAGE_RECEIVED'
  if (filter === 'jobs')        return n.type === 'JOB_POSTED' || n.type === 'APPLICATION_STATUS'
  return true
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function NotificationSkeleton() {
  return (
    <div className="flex animate-pulse items-start gap-4 rounded-2xl border border-slate-200/60 bg-white p-4 dark:border-white/[0.07] dark:bg-slate-800/60">
      <div className="h-10 w-10 flex-shrink-0 rounded-full bg-slate-200 dark:bg-white/10" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-3 w-3/4 rounded bg-slate-200 dark:bg-white/10" />
        <div className="h-2.5 w-1/3 rounded bg-slate-100 dark:bg-white/5" />
      </div>
    </div>
  )
}

// ── NotificationItem ──────────────────────────────────────────────────────────

function NotificationItem({
  notification, onRead, isDemo,
}: {
  notification: NotificationResponse
  onRead: (id: number) => void
  isDemo: boolean
}) {
  const navigate = useNavigate()
  const message  = parseMessage(notification)
  const cfg      = TYPE_CONFIG[notification.type]
  const isUnread = !notification.readFlag

  function handleClick() {
    if (isUnread && !isDemo) onRead(notification.id)
    if (cfg?.action) navigate(cfg.action)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, height: 0 }}
      transition={{ duration: 0.2 }}
      onClick={handleClick}
      className={`group relative flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition-all duration-200 ${
        isUnread
          ? 'border-indigo-200/80 bg-indigo-50/60 hover:bg-indigo-50 dark:border-indigo-500/20 dark:bg-indigo-500/[0.07] dark:hover:bg-indigo-500/10'
          : 'border-slate-200/60 bg-white hover:bg-slate-50 dark:border-white/[0.07] dark:bg-slate-800/60 dark:hover:bg-slate-800/80'
      }`}
    >
      {/* Unread dot */}
      {isUnread && (
        <span className="absolute right-4 top-4 h-2 w-2 rounded-full bg-indigo-500" />
      )}

      {/* Icon */}
      <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${cfg?.iconBg ?? 'bg-slate-100 text-slate-500'}`}>
        {cfg?.icon ?? <Bell className="h-4 w-4" />}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 pr-6">
        <p className={`text-sm leading-snug ${isUnread ? 'font-medium text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
          {message}
        </p>
        <div className="mt-1.5 flex items-center gap-2">
          {cfg?.label && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-white/10 dark:text-slate-400">
              {cfg.label}
            </span>
          )}
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            {timeAgo(notification.createdAt)}
          </span>
        </div>
      </div>

      {/* Mark read button */}
      {isUnread && (
        <motion.button
          onClick={(e) => { e.stopPropagation(); onRead(notification.id) }}
          whileTap={{ scale: 0.9 }}
          className="absolute right-4 top-1/2 -translate-y-1/2 flex-shrink-0 rounded-lg p-1.5 text-slate-400 opacity-0 transition-all group-hover:opacity-100 hover:bg-white hover:text-indigo-600 dark:hover:bg-white/10 dark:hover:text-indigo-400"
          title="Mark as read"
        >
          <Check className="h-3.5 w-3.5" />
        </motion.button>
      )}
    </motion.div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const queryClient = useQueryClient()
  const [demoRead, setDemoRead] = useState<Set<number>>(new Set())
  const [filter, setFilter] = useState<FilterKey>('all')

  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => getNotifications(false, 0, 50),
    refetchInterval: 30000,
  })

  const realNotifications = notificationsData?.content ?? []
  const isDemo = !isLoading && realNotifications.length === 0

  const allNotifications: NotificationResponse[] = isDemo
    ? DEMO_NOTIFICATIONS.map((n) => ({ ...n, readFlag: demoRead.has(n.id) || n.readFlag }))
    : realNotifications

  const filtered = allNotifications.filter((n) => matchesFilter(n, filter))
  const unreadCount = allNotifications.filter((n) => !n.readFlag).length

  const markAllMutation = useMutation({
    mutationFn: markAllRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    onError: () => useUIStore.getState().addToast('Could not mark notifications as read', 'error'),
  })

  const markOneMutation = useMutation({
    mutationFn: (id: number) => markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    onError: () => useUIStore.getState().addToast('Could not mark notification as read', 'error'),
  })

  function handleRead(id: number) {
    if (isDemo) setDemoRead((prev) => new Set([...prev, id]))
    else markOneMutation.mutate(id)
  }

  function handleMarkAllRead() {
    if (isDemo) setDemoRead(new Set(DEMO_NOTIFICATIONS.map((n) => n.id)))
    else markAllMutation.mutate()
  }

  return (
    <PageTransition>
      <div className="page-bg min-h-screen pb-12">
        <div className="mx-auto max-w-2xl px-4 py-6">

          {/* ── Header ── */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-sm">
                  <Bell className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Notifications</h1>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-xs font-bold text-white">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                  </p>
                </div>
              </div>

              {unreadCount > 0 && (
                <motion.button
                  onClick={handleMarkAllRead}
                  disabled={markAllMutation.isPending}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all read
                </motion.button>
              )}
            </div>

            {/* Demo banner */}
            {isDemo && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-700 dark:border-amber-500/20 dark:bg-amber-900/20 dark:text-amber-400"
              >
                <Bell className="h-4 w-4 flex-shrink-0" />
                Showing sample notifications — real ones appear here as activity happens
              </motion.div>
            )}

            {/* ── Filter tabs ── */}
            <div className="mt-5 flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {FILTER_TABS.map((tab) => {
                const count = tab.key === 'unread'
                  ? unreadCount
                  : tab.key === 'all'
                  ? allNotifications.length
                  : allNotifications.filter((n) => matchesFilter(n, tab.key)).length

                return (
                  <button
                    type="button"
                    key={tab.key}
                    onClick={() => setFilter(tab.key)}
                    className={`relative flex flex-shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-150 ${
                      filter === tab.key
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                        : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                    }`}
                  >
                    {tab.label}
                    {count > 0 && (
                      <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none ${
                        filter === tab.key
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* ── Notification list ── */}
          {isLoading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 5 }).map((_, i) => <NotificationSkeleton key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center rounded-2xl border border-slate-200/60 bg-white py-20 text-center dark:border-white/[0.07] dark:bg-slate-800/60"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/5">
                <BellOff className="h-6 w-6 text-slate-400 dark:text-slate-500" />
              </div>
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                {filter === 'unread' ? 'No unread notifications' : filter === 'all' ? 'All caught up!' : `No ${filter} notifications`}
              </p>
              <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
                {filter !== 'all' ? (
                  <button type="button" onClick={() => setFilter('all')} className="text-indigo-500 hover:underline">
                    View all notifications
                  </button>
                ) : 'You\'re up to date — check back later.'}
              </p>
            </motion.div>
          ) : (
            <motion.div
              className="flex flex-col gap-2.5"
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
            >
              <AnimatePresence mode="popLayout">
                {filtered.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onRead={handleRead}
                    isDemo={isDemo}
                  />
                ))}
              </AnimatePresence>

              {filtered.length > 0 && (
                <div className="pt-2 text-center">
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {filtered.length} notification{filtered.length !== 1 ? 's' : ''}
                    {filter !== 'all' && (
                      <button type="button" onClick={() => setFilter('all')} className="ml-2 text-indigo-500 hover:underline">
                        View all
                      </button>
                    )}
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </PageTransition>
  )
}
