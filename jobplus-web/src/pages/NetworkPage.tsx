import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { PageTransition } from '@/components/layout/PageTransition'
import { UserPlus, MessageSquare, UserMinus, Check, X, Users, UserCheck, Search } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { startConversation } from '@/api/messages'
import {
  getMyConnections,
  getIncomingRequests,
  getSuggestions,
  sendRequest,
  cancelRequest,
  acceptRequest,
  rejectRequest,
  removeConnection,
} from '@/api/connections'
import { BlurFade } from '@/components/magic/BlurFade'
import { useUIStore } from '@/store/uiStore'
import { getApiErrorMessage } from '@/api/client'
import type { User } from '@/types'
import { Avatar } from '@/components/ui/Avatar'
import { PageContainer } from '@/components/layout/PageContainer'
import { EmptyState } from '@/components/ui/EmptyState'

type Tab = 'My Connections' | 'Requests' | 'Grow Network'
const TABS: Tab[] = ['My Connections', 'Requests', 'Grow Network']

const CONN_KEYS = {
  connections: ['connections', 'list'] as const,
  requests: ['connections', 'requests'] as const,
  suggestions: ['connections', 'suggestions'] as const,
}

const DEMO_CONNECTIONS: Array<{ id: number; otherUser: User }> = [
  { id: -1, otherUser: { id: 2,  name: 'Sarah Chen',   headline: 'CEO · TechVentures',          avatarUrl: null } as User },
  { id: -2, otherUser: { id: 3,  name: 'James Liu',    headline: 'Strategy Consultant',          avatarUrl: null } as User },
  { id: -3, otherUser: { id: 4,  name: 'Alice Tan',    headline: 'Senior Engineer · ByteForge', avatarUrl: null } as User },
  { id: -4, otherUser: { id: 5,  name: 'David Park',   headline: 'Career Coach',                avatarUrl: null } as User },
]

const DEMO_REQUESTS: Array<{ id: number; otherUser: User }> = [
  { id: -1, otherUser: { id: 6,  name: 'Priya Nair',   headline: 'Head of Growth · Finova',          avatarUrl: null } as User },
  { id: -2, otherUser: { id: 7,  name: 'Marcus Osei',  headline: 'VP Engineering · GreenLogix',      avatarUrl: null } as User },
]

const CARD_GRADIENTS = [
  'from-indigo-500 to-violet-500',
  'from-emerald-500 to-teal-500',
  'from-rose-500 to-pink-500',
  'from-amber-500 to-orange-500',
  'from-cyan-500 to-blue-500',
  'from-purple-500 to-fuchsia-500',
  'from-teal-500 to-emerald-500',
  'from-sky-500 to-indigo-500',
]

function getGradient(name: string) {
  const idx = name.charCodeAt(0) % CARD_GRADIENTS.length
  return CARD_GRADIENTS[idx]
}

function AvatarCircle({ user, size = 'md' }: { user: User; size?: 'sm' | 'md' | 'lg' }) {
  const avatarSize = size === 'lg' ? 'lg' : size === 'sm' ? 'sm' : 'md'
  return <Avatar src={user.avatarUrl ?? null} name={user.name} size={avatarSize} />
}

function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200/60 bg-white p-5 dark:border-white/10 dark:bg-slate-800">
      <div className="flex flex-col items-center gap-3">
        <div className="h-16 w-16 rounded-full bg-slate-200 dark:bg-white/10" />
        <div className="h-3 w-24 rounded bg-slate-200 dark:bg-white/10" />
        <div className="h-2 w-32 rounded bg-slate-200 dark:bg-white/10" />
        <div className="mt-1 h-8 w-full rounded-xl bg-slate-100 dark:bg-white/5" />
      </div>
    </div>
  )
}

function ErrorState({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white py-12 text-center dark:border-white/10 dark:bg-white/5">
      <p className="text-sm font-medium text-red-600 dark:text-red-400">
        {error instanceof Error ? error.message : 'Failed to load'}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-3 rounded-xl bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/20"
      >
        Try again
      </button>
    </div>
  )
}

// ── Profile Card ──────────────────────────────────────────────────────────────

interface ProfileCardProps {
  user: User
  actions: React.ReactNode
  demo?: boolean
}

function ProfileCard({ user, actions, demo }: ProfileCardProps) {
  const gradient = getGradient(user.name)
  return (
    <div className="group flex flex-col rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm transition-all duration-300 hover:border-indigo-200/60 hover:shadow-lg hover:shadow-indigo-500/10 dark:border-white/10 dark:bg-slate-800 dark:hover:border-indigo-500/20">
      {/* Avatar + demo badge */}
      <div className="flex flex-col items-center text-center">
        <div className={`mb-3 rounded-full p-0.5 bg-gradient-to-br ${gradient}`}>
          <div className="rounded-full bg-white p-0.5 dark:bg-slate-800">
            <AvatarCircle user={user} size="lg" />
          </div>
        </div>

        <Link to={`/profile/${user.id}`} className="block w-full">
          <p className="truncate font-bold text-slate-900 transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
            {user.name}
          </p>
          {user.headline && (
            <p className="mt-0.5 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{user.headline}</p>
          )}
        </Link>

        {demo && (
          <span className="mt-1.5 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-400 dark:bg-white/10 dark:text-slate-500">
            Demo
          </span>
        )}
      </div>

      <div className="mt-4">{actions}</div>
    </div>
  )
}

// ── My Connections Tab ────────────────────────────────────────────────────────

function ConnectionsTab() {
  const prefersReducedMotion = useReducedMotion()
  const [search, setSearch] = useState('')
  const [confirmRemoveId, setConfirmRemoveId] = useState<number | null>(null)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const startMsgMutation = useMutation({
    mutationFn: (userId: number) => startConversation(userId),
    onSuccess: (convo) => navigate(`/messages?convo=${convo.id}`),
    onError: (err) => useUIStore.getState().addToast(getApiErrorMessage(err) || 'Could not open conversation', 'error'),
  })

  const { data: connections = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: CONN_KEYS.connections,
    queryFn: getMyConnections,
  })

  const removeMutation = useMutation({
    mutationFn: (id: number) => removeConnection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONN_KEYS.connections })
      useUIStore.getState().addToast('Connection removed', 'success')
    },
    onError: (err) => useUIStore.getState().addToast(getApiErrorMessage(err) || 'Could not remove connection', 'error'),
  })

  const filtered = connections.filter((c) =>
    c.otherUser.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="mb-5 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search connections…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-slate-500"
          />
        </div>
        <span className="flex-shrink-0 rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2 text-sm font-bold text-indigo-600 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400">
          {connections.length}
        </span>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3].map((i) => <CardSkeleton key={i} />)}
        </div>
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : connections.length === 0 ? (
        <div>
          <p className="mb-3 text-xs font-medium text-slate-400">Example connections — connect with others to see real ones</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {DEMO_CONNECTIONS.map((conn, i) => (
              <motion.div
                key={conn.id}
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.03 }}
                className="opacity-60"
              >
                <ProfileCard
                  user={conn.otherUser}
                  demo
                  actions={
                    <div className="flex gap-2">
                      <button
                        disabled
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-indigo-50 py-2 text-xs font-semibold text-indigo-600 opacity-50 dark:bg-indigo-900/20 dark:text-indigo-400"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        Message
                      </button>
                    </div>
                  }
                />
              </motion.div>
            ))}
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Users className="h-12 w-12 text-slate-300 dark:text-slate-600" />}
          title="No connections found"
          description="No connections match your search."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((conn, i) => (
              <motion.div
                key={conn.id}
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.2, delay: i * 0.03 }}
              >
                <ProfileCard
                  user={conn.otherUser}
                  actions={
                    confirmRemoveId === conn.id ? (
                      <div className="flex items-center gap-2">
                        <span className="flex-1 text-xs text-slate-500 dark:text-slate-400">Remove connection?</span>
                        <button
                          type="button"
                          onClick={() => setConfirmRemoveId(null)}
                          className="rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => { removeMutation.mutate(conn.id); setConfirmRemoveId(null) }}
                          disabled={removeMutation.isPending}
                          className="rounded-xl bg-red-500 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startMsgMutation.mutate(conn.otherUser.id)}
                        disabled={startMsgMutation.isPending}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-indigo-50 py-2 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-100 disabled:opacity-50 dark:bg-indigo-900/20 dark:text-indigo-400 dark:hover:bg-indigo-900/30"
                        aria-label="Message"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        Message
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmRemoveId(conn.id)}
                        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50 dark:bg-white/8 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                        aria-label="Remove connection"
                        disabled={removeMutation.isPending}
                      >
                        <UserMinus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    )
                  }
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

// ── Requests Tab ──────────────────────────────────────────────────────────────

function RequestsTab() {
  const prefersReducedMotion = useReducedMotion()
  const queryClient = useQueryClient()

  const { data: requests = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: CONN_KEYS.requests,
    queryFn: getIncomingRequests,
  })

  const acceptMutation = useMutation({
    mutationFn: (id: number) => acceptRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONN_KEYS.requests })
      queryClient.invalidateQueries({ queryKey: CONN_KEYS.connections })
      useUIStore.getState().addToast('Connection accepted', 'success')
    },
    onError: (err) => useUIStore.getState().addToast(getApiErrorMessage(err) || 'Could not accept request', 'error'),
  })

  const rejectMutation = useMutation({
    mutationFn: (id: number) => rejectRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONN_KEYS.requests })
      useUIStore.getState().addToast('Request declined', 'info')
    },
    onError: (err) => useUIStore.getState().addToast(getApiErrorMessage(err) || 'Could not decline request', 'error'),
  })

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => <CardSkeleton key={i} />)}
      </div>
    )
  }

  if (isError) {
    return <ErrorState error={error} onRetry={refetch} />
  }

  if (requests.length === 0) {
    return (
      <EmptyState
        icon={<UserPlus className="h-12 w-12 text-slate-300 dark:text-slate-600" />}
        title="No incoming requests"
        description="When someone sends you a connection request, you can accept or decline it here."
      />
    )

    return (
      <div>
        <p className="mb-3 text-xs font-medium text-slate-400">Example requests — these are demo items</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DEMO_REQUESTS.map((req, i) => (
            <motion.div
              key={req.id}
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.03 }}
              className="opacity-60"
            >
              <ProfileCard
                user={req.otherUser}
                demo
                actions={
                  <div className="flex gap-2">
                    <button type="button" disabled className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-emerald-100 py-2 text-xs font-semibold text-emerald-600 opacity-50">
                      <Check className="h-3.5 w-3.5" /> Accept
                    </button>
                    <button type="button" disabled className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-red-50 py-2 text-xs font-semibold text-red-500 opacity-50">
                      <X className="h-3.5 w-3.5" /> Decline
                    </button>
                  </div>
                }
              />
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <AnimatePresence mode="popLayout">
        {requests.map((req, i) => (
          <motion.div
            key={req.id}
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.2, delay: i * 0.03 }}
          >
            <ProfileCard
              user={req.otherUser}
              actions={
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => acceptMutation.mutate(req.id)}
                    disabled={acceptMutation.isPending || rejectMutation.isPending}
                    className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-2 text-xs font-bold text-white shadow-sm transition hover:shadow-md disabled:opacity-50"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Accept
                  </button>
                  <button
                    type="button"
                    onClick={() => rejectMutation.mutate(req.id)}
                    disabled={acceptMutation.isPending || rejectMutation.isPending}
                    className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-red-200 bg-red-50 py-2 text-xs font-bold text-red-500 transition hover:bg-red-100 disabled:opacity-50 dark:border-red-900/30 dark:bg-red-900/10 dark:hover:bg-red-900/20"
                  >
                    <X className="h-3.5 w-3.5" />
                    Decline
                  </button>
                </div>
              }
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// ── Grow Network Tab ──────────────────────────────────────────────────────────

function GrowNetworkTab() {
  const prefersReducedMotion = useReducedMotion()
  const [sentIds, setSentIds] = useState<Set<number>>(new Set())
  const [hoveredId, setHoveredId] = useState<number | null>(null)

  const { data: suggestions = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: CONN_KEYS.suggestions,
    queryFn: () => getSuggestions(20),
  })

  const connectMutation = useMutation({
    mutationFn: (userId: number) => sendRequest(userId),
    onSuccess: (_data, userId) => {
      setSentIds((prev) => new Set(prev).add(userId))
      useUIStore.getState().addToast('Connection request sent', 'success')
    },
    onError: (err) => useUIStore.getState().addToast(getApiErrorMessage(err) || 'Could not send request', 'error'),
  })

  const cancelMutation = useMutation({
    mutationFn: (userId: number) => cancelRequest(userId),
    onSuccess: (_data, userId) =>
      setSentIds((prev) => { const next = new Set(prev); next.delete(userId); return next }),
    onError: (err) => useUIStore.getState().addToast(getApiErrorMessage(err) || 'Could not cancel request', 'error'),
  })

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => <CardSkeleton key={i} />)}
      </div>
    )
  }

  if (isError) {
    return <ErrorState error={error} onRetry={refetch} />
  }

  if (suggestions.length === 0) {
    return (
      <EmptyState
        icon={<UserPlus className="h-12 w-12 text-slate-300 dark:text-slate-600" />}
        title="No suggestions"
        description="Check back later!"
      />
    )
  }

  const listVariants = {
    hidden: {},
    show: { transition: { staggerChildren: prefersReducedMotion ? 0 : 0.06 } },
  }
  const itemVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 16 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <motion.div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      variants={listVariants}
      initial="hidden"
      animate="show"
    >
      {suggestions.map((user: User) => (
        <motion.div key={user.id} variants={itemVariants}>
          <BlurFade>
            <ProfileCard
              user={user}
              actions={
                sentIds.has(user.id) ? (
                  <motion.button
                    type="button"
                    onClick={() => cancelMutation.mutate(user.id)}
                    disabled={cancelMutation.isPending}
                    onMouseEnter={() => setHoveredId(user.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
                    title="Click to cancel request"
                    className={`flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all ${
                      hoveredId === user.id
                        ? 'border border-red-300 bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400'
                        : 'border border-slate-200 bg-slate-50 text-slate-500 dark:border-white/15 dark:bg-white/8 dark:text-slate-400'
                    }`}
                  >
                    {hoveredId === user.id ? (
                      <><X className="h-3.5 w-3.5" />Cancel</>
                    ) : (
                      <><Check className="h-3.5 w-3.5" />Sent</>
                    )}
                  </motion.button>
                ) : (
                  <motion.button
                    type="button"
                    onClick={() => connectMutation.mutate(user.id)}
                    disabled={connectMutation.isPending}
                    whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-2 text-xs font-bold text-white shadow-sm shadow-indigo-500/25 transition hover:shadow-md hover:shadow-indigo-500/30 disabled:opacity-60"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    Connect
                  </motion.button>
                )
              }
            />
          </BlurFade>
        </motion.div>
      ))}
    </motion.div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function NetworkPage() {
  const [activeTab, setActiveTab] = useState<Tab>('My Connections')
  const hasInitializedTab = useRef(false)
  const prefersReducedMotion = useReducedMotion()

  const { data: connections = [], isSuccess: connectionsLoaded } = useQuery({
    queryKey: CONN_KEYS.connections,
    queryFn: getMyConnections,
  })

  const { data: requests = [] } = useQuery({
    queryKey: CONN_KEYS.requests,
    queryFn: getIncomingRequests,
  })

  useEffect(() => {
    if (!hasInitializedTab.current && connectionsLoaded) {
      hasInitializedTab.current = true
      if (connections.length === 0) {
        setActiveTab('Grow Network')
      }
    }
  }, [connectionsLoaded, connections.length])

  const tabIcons: Record<Tab, React.ReactNode> = {
    'My Connections': <UserCheck className="h-4 w-4" />,
    'Requests':       <UserPlus className="h-4 w-4" />,
    'Grow Network':   <Users className="h-4 w-4" />,
  }

  return (
    <PageTransition>
      <div className="page-bg min-h-screen pb-12">

        {/* ── Hero ── */}
        <div className="relative overflow-hidden border-b border-slate-200/60 bg-white dark:border-white/10 dark:bg-slate-900">
          {/* decorative blobs — subtle, not full-bleed */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-indigo-100/60 blur-3xl dark:bg-indigo-900/20" />
          <div className="pointer-events-none absolute -left-10 bottom-0 h-48 w-48 rounded-full bg-violet-100/40 blur-2xl dark:bg-violet-900/10" />

          <div className="relative mx-auto max-w-6xl px-4 py-8">
            <div className="flex flex-wrap items-center justify-between gap-6">

              {/* left — icon + title */}
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-indigo-100 shadow-sm dark:bg-indigo-500/20">
                  <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    My Network
                  </h1>
                  <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                    Grow your professional connections
                  </p>
                </div>
              </div>

              {/* right — stat chips */}
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center rounded-2xl border border-indigo-100 bg-indigo-50 px-5 py-3 dark:border-indigo-500/20 dark:bg-indigo-500/10">
                  <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
                    {connections.length}
                  </span>
                  <span className="text-[11px] font-medium text-indigo-400 dark:text-indigo-500">
                    Connections
                  </span>
                </div>
                {requests.length > 0 && (
                  <div className="flex flex-col items-center rounded-2xl border border-red-200 bg-red-50 px-5 py-3 dark:border-red-900/30 dark:bg-red-900/10">
                    <span className="text-xl font-extrabold text-red-500 dark:text-red-400">
                      {requests.length}
                    </span>
                    <span className="text-[11px] font-medium text-red-400 dark:text-red-500">
                      Pending
                    </span>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* thin accent line at the very bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-300/60 to-transparent dark:via-indigo-600/30" />
        </div>

        <PageContainer size="lg">
          {/* Tabs */}
          <div className="mb-7 flex gap-0 overflow-x-auto border-b border-slate-200/60 dark:border-white/10">
            {TABS.map((tab) => (
              <motion.button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
                className={`relative flex flex-shrink-0 items-center gap-2 px-5 py-3 text-sm font-semibold transition-colors ${
                  activeTab === tab
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <span className={activeTab === tab ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}>
                  {tabIcons[tab]}
                </span>
                {tab}
                {tab === 'Requests' && requests.length > 0 && (
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    activeTab === tab
                      ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400'
                      : 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400'
                  }`}>
                    {requests.length}
                  </span>
                )}
                {activeTab === tab && (
                  <motion.div
                    layoutId="tab-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-indigo-600 dark:bg-indigo-400"
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* Tab content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {activeTab === 'My Connections' && <ConnectionsTab />}
              {activeTab === 'Requests' && <RequestsTab />}
              {activeTab === 'Grow Network' && <GrowNetworkTab />}
            </motion.div>
          </AnimatePresence>
        </PageContainer>
      </div>
    </PageTransition>
  )
}
