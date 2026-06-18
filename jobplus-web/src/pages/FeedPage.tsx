import { useRef, useState, type ChangeEvent } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { PageTransition } from '@/components/layout/PageTransition'
import {
  PenSquare, UserPlus, Heart, MessageCircle, Briefcase,
  Users, Eye, Sparkles, Share2, Image, Video, FileText,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { getFeed, getTrending, likePost, unlikePost, deletePost } from '@/api/posts'
import { getSuggestions, sendRequest, cancelRequest } from '@/api/connections'
import { feedKeys } from '@/features/feed/queryKeys'
import PostCard from '@/features/feed/components/PostCard'
import CreatePostModal from '@/features/feed/components/CreatePostModal'
import TrendingContent from '@/features/feed/components/TrendingContent'
import { Avatar } from '@/components/ui/Avatar'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Post, PaginatedResponse } from '@/types'

// ── Helpers ───────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

// ── Demo data ─────────────────────────────────────────────────────────────────

interface DemoJob {
  id: number
  title: string
  company: string
  match: number
  salary: string
  type: string
}

const DEMO_JOBS: DemoJob[] = [
  { id: 1, title: 'Senior Frontend Engineer', company: 'TechVentures', match: 98, salary: '$120k–$150k', type: 'Remote' },
  { id: 2, title: 'Product Designer',         company: 'DesignCo',     match: 92, salary: '$90k–$110k',  type: 'Hybrid' },
  { id: 3, title: 'Full Stack Developer',     company: 'ByteForge',    match: 87, salary: '$100k–$130k', type: 'On-site' },
  { id: 4, title: 'Data Engineer',            company: 'DataFlow Inc', match: 81, salary: '$110k–$140k', type: 'Remote' },
  { id: 5, title: 'DevOps Engineer',          company: 'CloudBase',    match: 76, salary: '$105k–$125k', type: 'Remote' },
]

interface DemoFeedPostData {
  author: string
  avatarColor: string
  role: string
  content: string
  image: string
  likes: number
  comments: number
  time: string
}

const DEMO_FEED_POSTS: DemoFeedPostData[] = [
  {
    author: 'Sarah Chen',
    avatarColor: 'from-pink-400 to-rose-500',
    role: 'CEO · TechVentures',
    content: 'Just closed our Series B! 18 months ago we had 10 employees and a vision. Today we have 100+ and a product that actually works. Grateful for the incredible team that made this possible 🎉',
    image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=400&fit=crop',
    likes: 247,
    comments: 43,
    time: '2h ago',
  },
  {
    author: 'Alice Tan',
    avatarColor: 'from-violet-400 to-purple-500',
    role: 'Senior Engineer · ByteForge',
    content: 'One year ago I negotiated a 40% salary increase. The secret? I showed up with data — market rates, my impact metrics, the cost of replacing me. No drama, just numbers. Your salary is a negotiation, treat it like one.',
    image: 'https://images.unsplash.com/photo-1553484771-371a605b060b?w=800&h=400&fit=crop',
    likes: 134,
    comments: 28,
    time: '4h ago',
  },
  {
    author: 'Raj Patel',
    avatarColor: 'from-blue-400 to-indigo-500',
    role: 'Staff Engineer',
    content: 'Hot take: the best engineers write the least code. Every line you write is a liability. The best solution is often deleting code, not adding it.',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop',
    likes: 312,
    comments: 67,
    time: '6h ago',
  },
  {
    author: 'Marcus Williams',
    avatarColor: 'from-emerald-400 to-teal-500',
    role: 'Engineering Manager · CloudBase',
    content: "Just wrapped Q2 roadmap planning. Key insight: the teams that ship fastest aren't the ones with the best engineers — they're the ones with the clearest priorities. Focus beats talent 9 times out of 10.",
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=400&fit=crop',
    likes: 189,
    comments: 35,
    time: '1d ago',
  },
]

// ── Hero sub-components ───────────────────────────────────────────────────────

function StatPill({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-1.5 backdrop-blur-sm">
      <span className="text-white/70">{icon}</span>
      <span className="text-sm font-bold text-white">{value}</span>
      <span className="hidden text-xs text-white/60 sm:inline">{label}</span>
    </div>
  )
}

interface FloatingCardProps {
  title: string
  company: string
  matchPct: number
  top: number
  right: number
  rotate: number
  animDelay: number
  reducedMotion: boolean | null
}

function FloatingCard({ title, company, matchPct, top, right, rotate, animDelay, reducedMotion }: FloatingCardProps) {
  return (
    <motion.div
      className="absolute min-w-[176px] rounded-2xl bg-white/96 p-3.5 shadow-2xl"
      style={{ top, right, rotate }}
      animate={reducedMotion ? {} : { y: [0, -10, 0] }}
      transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut', delay: animDelay }}
    >
      <span className="inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
        {matchPct}% match
      </span>
      <p className="mt-1.5 text-sm font-semibold leading-tight text-slate-900">{title}</p>
      <p className="mt-0.5 text-xs text-slate-500">{company}</p>
    </motion.div>
  )
}

function HeroSection({ firstName }: { firstName: string }) {
  const reducedMotion = useReducedMotion()

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-6 md:p-8"
    >
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-8 -left-8 h-36 w-36 rounded-full bg-purple-300/20 blur-2xl" />
      <div className="pointer-events-none absolute right-1/3 top-0 h-28 w-28 rounded-full bg-indigo-300/20 blur-xl" />
      <div className="pointer-events-none absolute bottom-4 right-1/4 h-20 w-20 rounded-full bg-violet-300/15 blur-lg" />

      <div className="relative z-10 flex items-start justify-between gap-6">
        {/* Left: text + stats */}
        <div className="flex-1">
          <motion.p
            initial={reducedMotion ? false : { opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.08, duration: 0.38 }}
            className="text-sm font-medium text-indigo-200"
          >
            Good {getGreeting()},
          </motion.p>

          <motion.h1
            initial={reducedMotion ? false : { opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.16, duration: 0.38 }}
            className="mt-0.5 text-2xl font-bold text-white md:text-3xl"
          >
            {firstName} 👋
          </motion.h1>

          <motion.p
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.28, duration: 0.4 }}
            className="mt-1.5 max-w-xs text-sm leading-relaxed text-indigo-200"
          >
            Your network is growing — here's what's happening today.
          </motion.p>

          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38, duration: 0.38 }}
            className="mt-4 flex flex-wrap items-center gap-2"
          >
            <StatPill icon={<Eye className="h-3.5 w-3.5" />} value="128" label="Profile views" />
            <StatPill icon={<Users className="h-3.5 w-3.5" />} value="47" label="Connections" />
            <StatPill icon={<Briefcase className="h-3.5 w-3.5" />} value="5" label="Applications" />
          </motion.div>

          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.48, duration: 0.38 }}
            className="mt-5"
          >
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-indigo-700 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              <Sparkles className="h-4 w-4" />
              Explore jobs
            </Link>
          </motion.div>
        </div>

        {/* Right: floating cards — desktop only */}
        <div className="relative hidden h-52 w-64 flex-shrink-0 md:block">
          <FloatingCard
            title="Senior Frontend Engineer" company="TechVentures"
            matchPct={98} top={0} right={0} rotate={-3} animDelay={0} reducedMotion={reducedMotion}
          />
          <FloatingCard
            title="Full Stack Developer" company="ByteForge"
            matchPct={92} top={76} right={30} rotate={4} animDelay={0.9} reducedMotion={reducedMotion}
          />
          <FloatingCard
            title="Data Engineer" company="DataFlow Inc"
            matchPct={85} top={152} right={6} rotate={-2} animDelay={1.8} reducedMotion={reducedMotion}
          />
        </div>
      </div>
    </motion.div>
  )
}

// ── Job recommendations strip ─────────────────────────────────────────────────

function JobMatchStrip() {
  const reducedMotion = useReducedMotion()

  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Recommended for you</h2>
        <Link to="/jobs" className="ml-auto text-xs font-medium text-primary hover:underline">
          See all →
        </Link>
      </div>
      <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
        {DEMO_JOBS.map((job, i) => (
          <motion.div
            key={job.id}
            initial={reducedMotion ? false : { opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 + 0.15, duration: 0.32, ease: 'easeOut' }}
            whileHover={reducedMotion ? {} : { y: -4 }}
          >
            <Link
              to={`/jobs/${job.id}`}
              className="block w-52 flex-shrink-0 rounded-2xl border border-slate-200/70 bg-white p-4 transition-shadow hover:shadow-md dark:border-white/10 dark:bg-slate-800"
            >
              <div className="mb-2.5 flex items-start justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Briefcase className="h-4 w-4 text-primary" />
                </div>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                  {job.match}% match
                </span>
              </div>
              <p className="text-sm font-semibold leading-tight text-slate-900 dark:text-white">{job.title}</p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{job.company}</p>
              <div className="mt-3 flex items-center gap-1.5">
                <span className="text-xs font-medium text-primary">{job.salary}</span>
                <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                <span className="text-xs text-slate-400">{job.type}</span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ── Demo feed card ────────────────────────────────────────────────────────────

function DemoFeedCard({ data }: { data: DemoFeedPostData }) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(data.likes)
  const [showDemoMsg, setShowDemoMsg] = useState(false)
  const [shareFeedback, setShareFeedback] = useState(false)

  async function handleShare() {
    const url = window.location.href
    try {
      if (navigator.share && navigator.canShare?.({ url })) {
        await navigator.share({ title: `Post by ${data.author} on JobPlus`, url })
        return
      }
    } catch { /* user cancelled */ }
    try { await navigator.clipboard.writeText(url) } catch { /* silent */ }
    setShareFeedback(true)
    setTimeout(() => setShareFeedback(false), 2000)
  }

  function handleLike() {
    setLiked((l) => {
      setLikeCount((c) => (l ? c - 1 : c + 1))
      return !l
    })
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100/80 bg-white shadow-sm dark:border-white/[0.08] dark:bg-slate-800">
      <div className="h-0.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />
      <div className="flex items-start gap-3 px-5 pt-4">
        <div
          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${data.avatarColor} text-sm font-bold text-white`}
        >
          {data.author.slice(0, 1)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{data.author}</p>
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">{data.role}</p>
          <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">{data.time}</p>
        </div>
        <span className="flex-shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-400 dark:bg-slate-700 dark:text-slate-500">
          Demo
        </span>
      </div>
      <p className="mt-3.5 whitespace-pre-wrap px-5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
        {data.content}
      </p>
      <img
        src={data.image}
        alt=""
        loading="lazy"
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
        className="mt-4 max-h-[420px] w-full object-cover"
      />
      <div className="px-5 pb-1">
        <div className="flex items-center justify-between py-2 text-xs text-slate-400 dark:text-slate-500">
          <span className="flex items-center gap-1">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-pink-500 text-[8px] text-white">
              ♥
            </span>
            {likeCount}
          </span>
          <span>{data.comments} comments</span>
        </div>
        <div className="flex items-center border-t border-slate-100 pt-1 dark:border-white/10">
          <button
            type="button"
            onClick={handleLike}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-medium transition-colors ${
              liked
                ? 'text-red-500'
                : 'text-slate-500 hover:bg-slate-50 hover:text-red-400 dark:text-slate-400 dark:hover:bg-slate-700/50'
            }`}
          >
            <Heart className={`h-[18px] w-[18px] ${liked ? 'fill-red-500 text-red-500' : ''}`} />
            Like
          </button>
          <button
            type="button"
            onClick={() => setShowDemoMsg((v) => !v)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-medium transition-colors ${
              showDemoMsg
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-500 dark:text-slate-400 dark:hover:bg-slate-700/50'
            }`}
          >
            <MessageCircle className="h-[18px] w-[18px]" />
            Comment
          </button>
          <button
            type="button"
            onClick={handleShare}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-medium transition-colors ${
              shareFeedback
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700/50'
            }`}
          >
            <Share2 className="h-[18px] w-[18px]" />
            {shareFeedback ? 'Copied!' : 'Share'}
          </button>
        </div>
        {showDemoMsg && (
          <div className="mb-3 rounded-xl bg-indigo-50 px-4 py-3 text-center text-xs text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            Connect with people to see and post real comments.
          </div>
        )}
      </div>
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function PostSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-100/80 bg-white p-4 shadow-sm dark:border-white/[0.08] dark:bg-slate-800">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-32 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-2 w-24 rounded bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-3 w-5/6 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-3 w-4/6 rounded bg-slate-200 dark:bg-slate-700" />
      </div>
    </div>
  )
}

// ── People sidebar ────────────────────────────────────────────────────────────

function PeopleYouMayKnow() {
  const [sent, setSent] = useState<Set<number>>(new Set())
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set())
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const addToast = useUIStore((s) => s.addToast)

  const { data: suggestions = [] } = useQuery({
    queryKey: ['suggestions-sidebar'],
    queryFn: () => getSuggestions(3),
  })

  const connectMutation = useMutation({
    mutationFn: sendRequest,
    onMutate: (userId) => {
      setPendingIds((prev) => new Set([...prev, userId]))
    },
    onSuccess: (_, userId) => {
      setSent((prev) => new Set([...prev, userId]))
      setPendingIds((prev) => { const next = new Set(prev); next.delete(userId); return next })
      addToast('Connection request sent!', 'success')
    },
    onError: (_, userId) => {
      setPendingIds((prev) => { const next = new Set(prev); next.delete(userId); return next })
      addToast('Could not send request. Please try again.', 'error')
    },
  })

  const cancelMutation = useMutation({
    mutationFn: cancelRequest,
    onSuccess: (_, userId) => {
      setSent((prev) => { const next = new Set(prev); next.delete(userId); return next })
      addToast('Connection request cancelled', 'success')
    },
    onError: () => addToast('Could not cancel request. Please try again.', 'error'),
  })

  if (suggestions.length === 0) return null

  return (
    <div className="rounded-2xl border border-slate-100/80 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-white/10 dark:bg-slate-800">
      <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">People you may know</h3>
      <div className="space-y-1">
        {suggestions.map((u) => (
          <div
            key={u.id}
            className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-slate-50 dark:hover:bg-white/5"
          >
            <Avatar src={u.avatarUrl ?? null} name={u.name} size="sm" className="flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-slate-900 dark:text-white">{u.name}</p>
              {u.headline && (
                <p className="truncate text-[11px] text-slate-400 dark:text-slate-500">{u.headline}</p>
              )}
            </div>
            <button
              type="button"
              onMouseEnter={() => sent.has(u.id) && setHoveredId(u.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => {
                if (sent.has(u.id)) {
                  cancelMutation.mutate(u.id)
                } else if (!pendingIds.has(u.id)) {
                  connectMutation.mutate(u.id)
                }
              }}
              disabled={pendingIds.has(u.id)}
              title={sent.has(u.id) ? 'Click to cancel request' : `Connect with ${u.name}`}
              className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border transition
                ${sent.has(u.id)
                  ? hoveredId === u.id
                    ? 'border-red-400 bg-red-50 text-red-500 dark:bg-red-900/20'
                    : 'border-slate-300 bg-slate-100 text-slate-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-400'
                  : 'border-primary text-primary hover:bg-primary/10'
                } disabled:cursor-default disabled:opacity-50`}
              aria-label={sent.has(u.id) ? 'Cancel request' : `Connect with ${u.name}`}
            >
              {pendingIds.has(u.id) ? (
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              ) : sent.has(u.id) ? (
                hoveredId === u.id
                  ? <span className="text-[10px] font-bold">✕</span>
                  : <span className="text-[10px] font-semibold">✓</span>
              ) : (
                <UserPlus className="h-3 w-3" />
              )}
            </button>
          </div>
        ))}
      </div>
      <Link to="/network" className="mt-3 block text-center text-xs font-medium text-primary hover:underline">
        See all →
      </Link>
    </div>
  )
}

// ── Feed page ─────────────────────────────────────────────────────────────────

type Tab = 'Feed' | 'Trending'
const TABS: Tab[] = ['Feed', 'Trending']

function postTransition(index: number) {
  return {
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, scale: 0.97 },
    transition: {
      duration: 0.28,
      delay: Math.min(index, 5) * 0.08,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  }
}

export default function FeedPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Feed')
  const [showModal, setShowModal] = useState(false)
  const [composerMediaFile, setComposerMediaFile] = useState<File | null>(null)
  const user = useAuthStore((s) => s.user)
  const addToast = useUIStore((s) => s.addToast)
  const queryClient = useQueryClient()
  const photoInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const feedQuery = useQuery({
    queryKey: feedKeys.feed(0),
    queryFn: () => getFeed(0, 20),
  })

  const trendingQuery = useQuery({
    queryKey: feedKeys.trending(0),
    queryFn: () => getTrending(0, 20),
  })

  const feedPosts = feedQuery.data?.content ?? []
  const feedEmpty = feedQuery.isSuccess && feedPosts.length === 0
  const showFeedFallback = activeTab === 'Feed' && feedEmpty
  const effectiveTab = showFeedFallback ? 'Trending' : activeTab
  const activeQuery = effectiveTab === 'Feed' ? feedQuery : trendingQuery
  const activeKey = effectiveTab === 'Feed' ? feedKeys.feed(0) : feedKeys.trending(0)

  const likeMutation = useMutation({
    mutationFn: ({ postId, currentlyLiked }: { postId: number; currentlyLiked: boolean }) =>
      currentlyLiked ? unlikePost(postId) : likePost(postId),
    onMutate: async ({ postId, currentlyLiked }) => {
      await queryClient.cancelQueries({ queryKey: activeKey })
      const prev = queryClient.getQueryData<PaginatedResponse<Post>>(activeKey)
      queryClient.setQueryData<PaginatedResponse<Post>>(activeKey, (old) => {
        if (!old) return old
        return {
          ...old,
          content: old.content.map((p) =>
            p.id === postId
              ? { ...p, liked: !currentlyLiked, likeCount: currentlyLiked ? p.likeCount - 1 : p.likeCount + 1 }
              : p,
          ),
        }
      })
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(activeKey, ctx.prev)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (postId: number) => deletePost(postId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: feedKeys.feed(0) })
      void queryClient.invalidateQueries({ queryKey: feedKeys.trending(0) })
      addToast('Post deleted', 'success')
    },
    onError: () => addToast('Could not delete post. Please try again.', 'error'),
  })

  function handleLikeToggle(id: number, currentlyLiked: boolean) {
    likeMutation.mutate({ postId: id, currentlyLiked })
  }

  function handleDelete(id: number) {
    deleteMutation.mutate(id)
  }

  function openComposerWithMedia(file: File | null) {
    if (!file) return
    setComposerMediaFile(file)
    setShowModal(true)
  }

  function handleMediaSelection(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    openComposerWithMedia(file)
    event.target.value = ''
  }

  const firstName = user?.name?.split(' ')[0] ?? 'there'
  const posts = activeQuery.data?.content ?? []
  const isLoading = activeQuery.isLoading
  const isError = activeQuery.isError
  const error = activeQuery.error

  return (
    <PageTransition>
      <div className="page-bg min-h-screen pb-12">
        <div className="mx-auto max-w-4xl px-4 py-6">

          {/* Animated hero */}
          <HeroSection firstName={firstName} />

          {/* Job recommendations */}
          <JobMatchStrip />

          <div className="flex items-start gap-6">
            <div className={`min-w-0 flex-1 ${activeTab !== 'Trending' ? 'max-w-xl' : ''}`}>

              {/* Create post */}
              <div className="mb-5 overflow-hidden rounded-2xl border border-slate-100/80 bg-white shadow-sm dark:border-white/10 dark:bg-slate-800">
                <div className="h-0.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />
                <div className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white">
                      {user?.name?.slice(0, 1).toUpperCase() ?? 'U'}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowModal(true)}
                      className="flex-1 rounded-xl border border-slate-200/80 bg-slate-50 px-4 py-2.5 text-left text-sm text-slate-400 transition hover:border-indigo-300 hover:bg-indigo-50/30 dark:border-white/10 dark:bg-slate-700/50 dark:text-slate-500 dark:hover:border-indigo-500/50 dark:hover:bg-indigo-900/10"
                    >
                      What's on your mind, {firstName}?
                    </button>
                  </div>
                  <div className="mt-3 flex items-center gap-1 border-t border-slate-100 pt-3 dark:border-white/10">
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-xs font-medium text-slate-500 transition hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700/50"
                    >
                      <Image className="h-4 w-4 text-emerald-500" />
                      Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => videoInputRef.current?.click()}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-xs font-medium text-slate-500 transition hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700/50"
                    >
                      <Video className="h-4 w-4 text-amber-500" />
                      Video
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowModal(true)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-xs font-medium text-slate-500 transition hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700/50"
                    >
                      <FileText className="h-4 w-4 text-indigo-500" />
                      Article
                    </button>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="mb-5 flex gap-2">
                {TABS.map((tab) => (
                  <motion.button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    whileTap={{ scale: 0.97 }}
                    className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                      activeTab === tab
                        ? 'bg-primary text-white shadow'
                        : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                    }`}
                  >
                    {tab}
                  </motion.button>
                ))}
              </div>

              {/* Trending tab */}
              {activeTab === 'Trending' && <TrendingContent />}

              {/* Feed tab */}
              {activeTab !== 'Trending' && (
                <div className="flex flex-col gap-4">
                  {isLoading ? (
                    <>
                      <PostSkeleton />
                      <PostSkeleton />
                      <PostSkeleton />
                    </>
                  ) : isError ? (
                    <div className="flex flex-col items-center rounded-2xl border border-slate-100/80 bg-white py-16 text-center shadow-sm dark:border-white/[0.08] dark:bg-slate-800">
                      <p className="text-sm font-medium text-red-600">
                        {error instanceof Error ? error.message : 'Failed to load posts'}
                      </p>
                      <button
                        type="button"
                        onClick={() => void activeQuery.refetch()}
                        className="mt-3 rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary/20"
                      >
                        Try again
                      </button>
                    </div>
                  ) : showFeedFallback ? (
                    <>
                      <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
                        <p className="text-sm text-primary">
                          Connect with people to see their posts in your feed. Showing trending posts for now.{' '}
                          <Link to="/network" className="font-semibold underline">
                            Grow your network →
                          </Link>
                        </p>
                      </div>
                      {DEMO_FEED_POSTS.map((p, i) => (
                        <DemoFeedCard key={i} data={p} />
                      ))}
                      {trendingQuery.isLoading ? (
                        <>
                          <PostSkeleton />
                          <PostSkeleton />
                        </>
                      ) : posts.length === 0 ? (
                        <EmptyState
                          icon={<PenSquare className="h-12 w-12 text-slate-300" />}
                          title="No trending posts"
                          description="Nothing trending right now. Check back later."
                        />
                      ) : (
                        <AnimatePresence mode="popLayout">
                          {posts.map((post, index) => (
                            <motion.div key={post.id} {...postTransition(index)}>
                              <PostCard
                                post={post}
                                onLikeToggle={handleLikeToggle}
                                onDelete={handleDelete}
                                currentUserId={user?.id ?? -1}
                              />
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      )}
                    </>
                  ) : posts.length === 0 ? (
                    <EmptyState
                      icon={<PenSquare className="h-12 w-12 text-slate-300" />}
                      title="No posts yet"
                      description="Be the first to share something."
                      action={{ label: 'Create post', onClick: () => setShowModal(true) }}
                    />
                  ) : (
                    <AnimatePresence mode="popLayout">
                      {posts.map((post, index) => (
                        <motion.div key={post.id} {...postTransition(index)}>
                          <PostCard
                            post={post}
                            onLikeToggle={handleLikeToggle}
                            onDelete={handleDelete}
                            currentUserId={user?.id ?? -1}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}
                </div>
              )}
            </div>

            {/* Right sidebar */}
            {activeTab !== 'Trending' && (
              <motion.aside
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: 0.15, ease: 'easeOut' }}
                className="hidden w-72 flex-shrink-0 lg:block"
              >
                <div className="sticky top-20 space-y-4">
                  <PeopleYouMayKnow />
                  <div className="rounded-2xl border border-slate-100/80 bg-white p-4 shadow-sm dark:border-white/[0.08] dark:bg-slate-800">
                    <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-white">Trending topics</h3>
                    <div className="flex flex-wrap gap-2">
                      {['#JobSearch', '#TechCareers', '#RemoteWork', '#CareerTips', '#Hiring'].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setActiveTab('Trending')}
                          className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.aside>
            )}
          </div>
        </div>

        <AnimatePresence>
          {showModal && (
            <CreatePostModal
              initialMediaFile={composerMediaFile}
              onClose={() => {
                setShowModal(false)
                setComposerMediaFile(null)
              }}
              onCreated={() => {
                void queryClient.invalidateQueries({ queryKey: feedKeys.feed(0) })
                setActiveTab('Feed')
              }}
            />
          )}
        </AnimatePresence>

        <input
          ref={photoInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleMediaSelection}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          className="hidden"
          onChange={handleMediaSelection}
        />
      </div>
    </PageTransition>
  )
}
