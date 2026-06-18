import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion, useReducedMotion } from 'framer-motion'
import { PageTransition } from '@/components/layout/PageTransition'
import {
  Briefcase, Users, Sparkles, TrendingUp, Building2,
  UserPlus, Heart, MessageCircle, ArrowRight, Star,
  Zap, CheckCircle2,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { getFeed } from '@/api/posts'
import { getSuggestions, sendRequest, cancelRequest } from '@/api/connections'
import { feedKeys } from '@/features/feed/queryKeys'
import { Avatar } from '@/components/ui/Avatar'

// ── Helpers ───────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

function useCountUp(target: number, duration: number, delay: number, enabled: boolean) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!enabled) return
    const t = setTimeout(() => {
      const start = Date.now()
      const tick = () => {
        const p = Math.min((Date.now() - start) / duration, 1)
        const eased = 1 - Math.pow(1 - p, 3)
        setCount(Math.round(target * eased))
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, delay)
    return () => clearTimeout(t)
  }, [target, duration, delay, enabled])
  return count
}

// ── Demo data ─────────────────────────────────────────────────────────────────

const HERO_ACTIVITY = [
  { id: 1, icon: '🤝', text: 'Sarah Chen accepted your connection', time: '2m ago' },
  { id: 2, icon: '💼', text: 'ByteForge posted: Senior Engineer', time: '5m ago' },
  { id: 3, icon: '👀', text: 'Your profile was viewed 12 times today', time: '1h ago' },
  { id: 4, icon: '⭐', text: '5 new jobs matching your profile', time: '3h ago' },
]

const MARQUEE_COMPANIES = [
  { name: 'Google',     slug: 'google',     color: '4285F4' },
  { name: 'Netflix',    slug: 'netflix',    color: 'E50914' },
  { name: 'Amazon',     slug: 'amazon',     color: 'FF9900' },
  { name: 'Microsoft',  slug: 'microsoft',  color: '00A4EF' },
  { name: 'Meta',       slug: 'meta',       color: '0082FB' },
  { name: 'Spotify',    slug: 'spotify',    color: '1DB954' },
  { name: 'Airbnb',     slug: 'airbnb',     color: 'FF5A5F' },
  { name: 'Slack',      slug: 'slack',      color: '4A154B' },
  { name: 'Adobe',      slug: 'adobe',      color: 'FF0000' },
  { name: 'Salesforce', slug: 'salesforce', color: '00A1E0' },
  { name: 'Tesla',      slug: 'tesla',      color: 'CC0000' },
  { name: 'LinkedIn',   slug: 'linkedin',   color: '0A66C2' },
  { name: 'Shopify',    slug: 'shopify',    color: '96BF48' },
  { name: 'Figma',      slug: 'figma',      color: 'F24E1E' },
  { name: 'Dropbox',    slug: 'dropbox',    color: '0061FF' },
]

const HOME_JOBS = [
  { id: 1, title: 'Senior Frontend Engineer', company: 'TechVentures', match: 98, salary: '$120k–$150k', type: 'Remote' },
  { id: 2, title: 'Product Designer',         company: 'DesignCo',     match: 92, salary: '$90k–$110k',  type: 'Hybrid' },
  { id: 3, title: 'Full Stack Developer',     company: 'ByteForge',    match: 87, salary: '$100k–$130k', type: 'On-site' },
  { id: 4, title: 'Data Engineer',            company: 'DataFlow Inc', match: 81, salary: '$110k–$140k', type: 'Remote' },
]

const DEMO_COMPANIES = [
  { id: 'techventures', name: 'TechVentures', industry: 'Software',    followers: '12.4K' },
  { id: 'byteforge',    name: 'ByteForge',    industry: 'Engineering', followers: '8.7K'  },
  { id: 'dataflow',     name: 'DataFlow Inc', industry: 'Analytics',   followers: '6.2K'  },
]

const DEMO_POSTS = [
  {
    id: -1,
    author: 'TechVentures',
    role: 'Company · Software',
    content: '🚀 We just launched our new AI-powered hiring platform! Job seekers can now get instant feedback on their applications. Check it out and let us know what you think.',
    likes: 184,
    comments: 32,
  },
  {
    id: -2,
    author: 'ByteForge',
    role: 'Company · Engineering',
    content: '📣 We\'re hiring! ByteForge is growing fast and we need talented engineers to join our team. Check out our open roles — remote-friendly, competitive comp, and amazing culture.',
    likes: 97,
    comments: 18,
  },
]

const TRENDING_SKILLS = [
  'React', 'TypeScript', 'Python', 'AWS', 'Node.js',
  'GraphQL', 'Kubernetes', 'Rust', 'Next.js', 'LLMs',
]

const FOLLOWED_COMPANIES = [
  { id: 'techventures', name: 'TechVentures', industry: 'Software',    lastPost: '2h ago', preview: 'We just launched our new AI-powered hiring platform! Check it out.' },
  { id: 'byteforge',    name: 'ByteForge',    industry: 'Engineering', lastPost: '5h ago', preview: 'ByteForge is expanding to 3 new cities — exciting times ahead! 🚀' },
]

const YOUR_NETWORK = [
  { id: 1, name: 'Sarah Chen',   headline: 'Product Designer at DesignCo',  online: true  },
  { id: 2, name: 'Alex Rivera',  headline: 'Full Stack Engineer · Remote',   online: false },
  { id: 3, name: 'Priya Patel',  headline: 'Data Scientist at CloudBase',    online: true  },
]

// ── Hero ──────────────────────────────────────────────────────────────────────

function HeroSection({ firstName }: { firstName: string }) {
  const rm = useReducedMotion()

  return (
    <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 px-8 py-12">
      {/* Animated glow orbs */}
      {!rm && (
        <>
          <motion.div
            className="pointer-events-none absolute left-1/4 top-0 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl"
            animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0], scale: [1, 1.15, 0.9, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="pointer-events-none absolute bottom-0 right-1/4 h-48 w-48 rounded-full bg-violet-500/25 blur-3xl"
            animate={{ x: [0, -30, 20, 0], y: [0, 20, -15, 0], scale: [1, 0.9, 1.1, 1] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          />
          <motion.div
            className="pointer-events-none absolute right-8 top-8 h-32 w-32 rounded-full bg-purple-400/15 blur-2xl"
            animate={{ x: [0, 20, -10, 0], y: [0, -10, 15, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          />
        </>
      )}

      {/* Dot grid overlay */}
      <div className="banner-dot-pattern pointer-events-none absolute inset-0 opacity-[0.04]" />

      <div className="relative z-10 flex items-start gap-10">
        {/* Left */}
        <div className="flex-1">
          <motion.div
            initial={rm ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-400/30 bg-indigo-400/10 px-3 py-1 text-xs font-medium text-indigo-300">
              <Sparkles className="h-3 w-3" />
              AI-powered job matching
            </span>
          </motion.div>

          <motion.h1
            initial={rm ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.45 }}
            className="mt-4 text-3xl font-bold text-white md:text-4xl"
          >
            Good {getGreeting()},<br />
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              {firstName}
            </span>
          </motion.h1>

          <motion.p
            initial={rm ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.22, duration: 0.45 }}
            className="mt-3 max-w-sm text-base text-slate-400"
          >
            Your personalized career hub — jobs, companies, and connections all in one place.
          </motion.p>

          <motion.div
            initial={rm ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            className="mt-6 flex flex-wrap items-center gap-3"
          >
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:-translate-y-0.5 hover:bg-indigo-400"
            >
              <Briefcase className="h-4 w-4" />
              Browse Jobs
            </Link>
            <Link
              to="/network"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/15"
            >
              <Users className="h-4 w-4" />
              Explore Network
            </Link>
          </motion.div>
        </div>

        {/* Right: live activity panel — desktop only */}
        <motion.div
          initial={rm ? false : { opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="hidden w-72 flex-shrink-0 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md lg:block"
        >
          <div className="mb-3 flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            <span className="text-xs font-semibold text-slate-300">Live Activity</span>
          </div>
          <div className="space-y-2.5">
            {HERO_ACTIVITY.map((item, i) => (
              <motion.div
                key={item.id}
                initial={rm ? false : { opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1, duration: 0.32 }}
                className="flex items-start gap-2.5 rounded-xl bg-white/5 px-3 py-2.5"
              >
                <span className="mt-0.5 text-base leading-none">{item.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs leading-snug text-slate-200">{item.text}</p>
                  <p className="mt-0.5 text-[10px] text-slate-500">{item.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// ── Stats bar ─────────────────────────────────────────────────────────────────

const STAT_STYLES = [
  { iconBg: 'bg-indigo-100 dark:bg-indigo-500/20', iconColor: 'text-indigo-600 dark:text-indigo-400', numColor: 'text-indigo-600 dark:text-indigo-400' },
  { iconBg: 'bg-violet-100 dark:bg-violet-500/20', iconColor: 'text-violet-600 dark:text-violet-400', numColor: 'text-violet-600 dark:text-violet-400' },
  { iconBg: 'bg-emerald-100 dark:bg-emerald-500/20', iconColor: 'text-emerald-600 dark:text-emerald-400', numColor: 'text-emerald-600 dark:text-emerald-400' },
  { iconBg: 'bg-amber-100 dark:bg-amber-500/20', iconColor: 'text-amber-600 dark:text-amber-400', numColor: 'text-amber-600 dark:text-amber-400' },
]

function StatsBar() {
  const rm = useReducedMotion()
  const jobs = useCountUp(10000, 1800, 100, !rm)
  const companies = useCountUp(500, 1600, 200, !rm)
  const pros = useCountUp(50000, 2000, 300, !rm)
  const matchRate = useCountUp(95, 1400, 50, !rm)

  const stats = [
    { label: 'Jobs Available',  value: rm ? '10,000+' : `${jobs.toLocaleString()}+`,    icon: <Briefcase className="h-4 w-4" /> },
    { label: 'Companies',       value: rm ? '500+' : `${companies}+`,                   icon: <Building2 className="h-4 w-4" /> },
    { label: 'Professionals',   value: rm ? '50K+' : `${pros.toLocaleString()}+`,       icon: <Users className="h-4 w-4" />    },
    { label: 'Match Rate',      value: rm ? '95%' : `${matchRate}%`,                    icon: <Star className="h-4 w-4" />     },
  ]

  return (
    <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
      {stats.map((s, i) => {
        const style = STAT_STYLES[i]
        return (
          <motion.div
            key={s.label}
            initial={rm ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07, duration: 0.35 }}
            className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-800"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${style.iconBg} ${style.iconColor}`}>
              {s.icon}
            </div>
            <p className={`tabular-nums text-2xl font-extrabold ${style.numColor}`}>{s.value}</p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{s.label}</p>
          </motion.div>
        )
      })}
    </div>
  )
}

// ── Company marquee ───────────────────────────────────────────────────────────

type MarqueeCompany = typeof MARQUEE_COMPANIES[number]

function CompanyChip({ company }: { company: MarqueeCompany }) {
  return (
    <div className="flex flex-shrink-0 items-center gap-2.5 px-4">
      <img
        src={`https://cdn.simpleicons.org/${company.slug}/${company.color}`}
        alt=""
        className="h-6 w-6 flex-shrink-0"
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
      />
      <span className="whitespace-nowrap text-sm font-semibold text-slate-700 dark:text-slate-200">
        {company.name}
      </span>
    </div>
  )
}

function CompanyMarquee() {
  const rm = useReducedMotion()
  const row1 = [...MARQUEE_COMPANIES, ...MARQUEE_COMPANIES]
  const rotated = [...MARQUEE_COMPANIES.slice(8), ...MARQUEE_COMPANIES.slice(0, 8)]
  const row2 = [...rotated, ...rotated]

  return (
    <div className="mb-8 overflow-hidden rounded-2xl border border-slate-200/60 bg-white py-6 shadow-sm dark:border-white/10 dark:bg-slate-800">
      <p className="mb-5 px-6 text-xs font-semibold uppercase tracking-wider text-slate-400">
        Trusted by top companies
      </p>
      <div className="marquee-fade space-y-3">
        {/* Row 1 — scrolls left */}
        <div className="overflow-hidden">
          <motion.div
            className="flex items-center"
            animate={rm ? {} : { x: ['0%', '-50%'] }}
            transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
          >
            {row1.map((company, i) => (
              <CompanyChip key={i} company={company} />
            ))}
          </motion.div>
        </div>
        {/* Row 2 — scrolls right */}
        <div className="overflow-hidden">
          <motion.div
            className="flex items-center"
            animate={rm ? {} : { x: ['-50%', '0%'] }}
            transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}
          >
            {row2.map((company, i) => (
              <CompanyChip key={i} company={company} />
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

// ── Activity feed ─────────────────────────────────────────────────────────────

function DemoPostCard({ post }: { post: typeof DEMO_POSTS[number] }) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post.likes)

  function handleLike() {
    setLiked((l) => { setLikeCount((c) => (l ? c - 1 : c + 1)); return !l })
  }

  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-800">
      <div className="flex items-start gap-3">
        <img
          src={`https://api.dicebear.com/9.x/initials/svg?seed=${post.author}&backgroundColor=6366f1,8b5cf6&fontFamily=Arial&fontSize=40`}
          alt={post.author}
          className="h-10 w-10 flex-shrink-0 rounded-full"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{post.author}</p>
          <p className="text-xs text-slate-400">{post.role}</p>
        </div>
        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
          Company
        </span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">{post.content}</p>
      <div className="mt-3 flex items-center gap-4 border-t border-slate-100 pt-3 dark:border-white/10">
        <button type="button" onClick={handleLike} className="group flex items-center gap-1.5 text-sm">
          <Heart
            className={`h-[17px] w-[17px] transition-colors ${
              liked ? 'fill-red-500 text-red-500' : 'text-slate-400 group-hover:text-red-400'
            }`}
          />
          <span className={liked ? 'font-medium text-red-500' : 'text-slate-500'}>{likeCount}</span>
        </button>
        <span className="flex items-center gap-1.5 text-sm text-slate-400">
          <MessageCircle className="h-[17px] w-[17px]" />
          {post.comments}
        </span>
      </div>
    </div>
  )
}

function ActivityFeed() {
  const rm = useReducedMotion()
  const { data: feedData } = useQuery({
    queryKey: feedKeys.feed(0),
    queryFn: () => getFeed(0, 6),
  })
  const realCount = feedData?.content?.length ?? 0

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-5 w-1 rounded-full bg-indigo-500" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Company Activity</h2>
        </div>
        <Link to="/feed" className="flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20">
          {realCount > 0 ? `View ${realCount} more` : 'View feed'}
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="rounded-xl border border-slate-200/60 bg-slate-50 px-4 py-2.5 text-xs text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400 mb-3">
        Follow companies to see their live updates here. Showing sample activity.
      </div>
      <div className="space-y-3">
        {DEMO_POSTS.map((post, i) => (
          <motion.div
            key={post.id}
            initial={rm ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.35 }}
          >
            <DemoPostCard post={post} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ── Jobs grid ─────────────────────────────────────────────────────────────────

function JobsGrid() {
  const rm = useReducedMotion()

  return (
    <div className="mt-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-5 w-1 rounded-full bg-emerald-500" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Top Job Matches</h2>
        </div>
        <Link to="/jobs" className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20">
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {HOME_JOBS.map((job, i) => (
          <motion.div
            key={job.id}
            initial={rm ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.35 }}
            whileHover={rm ? {} : { y: -3 }}
            className="group cursor-pointer rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm transition-all duration-200 hover:border-emerald-200/60 hover:shadow-md hover:shadow-emerald-500/10 dark:border-white/10 dark:bg-slate-800 dark:hover:border-emerald-500/20"
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <img
                src={`https://api.dicebear.com/9.x/initials/svg?seed=${job.company}&backgroundColor=6366f1,8b5cf6,06b6d4&fontFamily=Arial&fontSize=40`}
                alt={job.company}
                className="h-10 w-10 rounded-xl shadow-sm"
              />
              <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                <CheckCircle2 className="h-3 w-3" />
                {job.match}%
              </span>
            </div>
            <p className="font-semibold text-slate-900 group-hover:text-emerald-700 dark:text-white dark:group-hover:text-emerald-400 transition-colors">{job.title}</p>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{job.company}</p>
            <div className="mt-3 flex items-center gap-2">
              <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">{job.salary}</span>
              <span className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                job.type === 'Remote'
                  ? 'bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400'
                  : job.type === 'Hybrid'
                    ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                    : 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-400'
              }`}>{job.type}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ── Sidebar sections ──────────────────────────────────────────────────────────

function FollowedCompanies() {
  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-800">
      <div className="mb-3 flex items-center gap-2">
        <div className="h-4 w-0.5 rounded-full bg-indigo-500" />
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Companies you follow</h3>
      </div>
      <div className="space-y-3.5">
        {FOLLOWED_COMPANIES.map((c) => (
          <div key={c.id}>
            <div className="flex items-center gap-2.5">
              <img
                src={`https://api.dicebear.com/9.x/initials/svg?seed=${c.name}&backgroundColor=6366f1,8b5cf6&fontFamily=Arial&fontSize=40`}
                alt={c.name}
                className="h-8 w-8 flex-shrink-0 rounded-xl"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-900 dark:text-white">{c.name}</p>
                <p className="text-[11px] text-slate-400">{c.industry} · {c.lastPost}</p>
              </div>
            </div>
            <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              {c.preview}
            </p>
          </div>
        ))}
      </div>
      <Link to="/feed" className="mt-3 block text-center text-xs font-medium text-primary hover:underline">
        View full feed →
      </Link>
    </div>
  )
}

function YourNetwork() {
  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-800">
      <div className="mb-3 flex items-center gap-2">
        <div className="h-4 w-0.5 rounded-full bg-emerald-500" />
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Your network</h3>
      </div>
      <div className="space-y-3">
        {YOUR_NETWORK.map((p) => (
          <div key={p.id} className="flex items-center gap-2.5">
            <div className="relative flex-shrink-0">
              <Avatar src={null} name={p.name} size="sm" />
              {p.online && (
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400 dark:border-slate-800" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">{p.name}</p>
              <p className="truncate text-[11px] text-slate-400">{p.headline}</p>
            </div>
          </div>
        ))}
      </div>
      <Link to="/network" className="mt-3 block text-center text-xs font-medium text-primary hover:underline">
        View all connections →
      </Link>
    </div>
  )
}

function CompanySuggestions() {
  const [followed, setFollowed] = useState<Set<string>>(new Set())
  const rm = useReducedMotion()

  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-800">
      <div className="mb-3 flex items-center gap-2">
        <div className="h-4 w-0.5 rounded-full bg-violet-500" />
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Companies to follow</h3>
      </div>
      <div className="space-y-3">
        {DEMO_COMPANIES.map((c) => (
          <div key={c.id} className="flex items-center gap-2.5">
            <img
              src={`https://api.dicebear.com/9.x/initials/svg?seed=${c.name}&backgroundColor=6366f1,8b5cf6&fontFamily=Arial&fontSize=40`}
              alt={c.name}
              className="h-9 w-9 flex-shrink-0 rounded-xl"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-slate-900 dark:text-white">{c.name}</p>
              <p className="text-[11px] text-slate-400">{c.industry} · {c.followers} followers</p>
            </div>
            <motion.button
              onClick={() =>
                setFollowed((prev) => {
                  const next = new Set(prev)
                  if (next.has(c.id)) next.delete(c.id)
                  else next.add(c.id)
                  return next
                })
              }
              whileTap={rm ? {} : { scale: 0.95 }}
              className={`flex-shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-medium transition ${
                followed.has(c.id)
                  ? 'bg-primary text-white'
                  : 'border border-primary text-primary hover:bg-primary/10'
              }`}
            >
              {followed.has(c.id) ? '✓ Following' : '+ Follow'}
            </motion.button>
          </div>
        ))}
      </div>
      <Link to="/companies" className="mt-3 block text-center text-xs font-medium text-primary hover:underline">
        See all companies →
      </Link>
    </div>
  )
}

function PeopleToConnect() {
  const [sent, setSent] = useState<Set<number>>(new Set())
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set())
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const addToast = useUIStore((s) => s.addToast)

  const { data: suggestions = [] } = useQuery({
    queryKey: ['suggestions-home'],
    queryFn: () => getSuggestions(4),
  })

  const connectMutation = useMutation({
    mutationFn: sendRequest,
    onMutate: (userId) => setPendingIds((prev) => new Set([...prev, userId])),
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
    <div className="rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-800">
      <div className="mb-3 flex items-center gap-2">
        <div className="h-4 w-0.5 rounded-full bg-amber-500" />
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">People you may know</h3>
      </div>
      <div className="space-y-3">
        {suggestions.map((u) => (
          <div key={u.id} className="flex items-center gap-2.5">
            <Avatar src={u.avatarUrl ?? null} name={u.name} size="sm" className="flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-slate-900 dark:text-white">{u.name}</p>
              {u.headline && <p className="truncate text-[11px] text-slate-400">{u.headline}</p>}
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
              className={`flex-shrink-0 rounded-lg border px-2 py-1 text-[11px] font-medium transition
                ${sent.has(u.id)
                  ? hoveredId === u.id
                    ? 'border-red-400 bg-red-50 text-red-500 dark:bg-red-900/20'
                    : 'border-slate-300 bg-slate-100 text-slate-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-400'
                  : 'border-primary text-primary hover:bg-primary/10'
                } disabled:opacity-60`}
            >
              {pendingIds.has(u.id)
                ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent inline-block" />
                : sent.has(u.id)
                  ? hoveredId === u.id ? '✕ Cancel' : '✓ Sent'
                  : <UserPlus className="h-3 w-3" />
              }
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

function TrendingSkills() {
  const rm = useReducedMotion()

  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-800">
      <div className="mb-3 flex items-center gap-2">
        <div className="h-4 w-0.5 rounded-full bg-teal-500" />
        <TrendingUp className="h-3.5 w-3.5 text-teal-500" />
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Trending Skills</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {TRENDING_SKILLS.map((skill, i) => (
          <motion.span
            key={skill}
            initial={rm ? false : { opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04, duration: 0.22 }}
            whileHover={rm ? {} : { scale: 1.08 }}
            className="cursor-default rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
          >
            {skill}
          </motion.span>
        ))}
      </div>
    </div>
  )
}

// ── Career Tips ───────────────────────────────────────────────────────────────

const CAREER_TIPS = [
  {
    icon: <Sparkles className="h-5 w-5" />,
    gradient: 'from-indigo-500 to-violet-500',
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    text: 'text-indigo-600 dark:text-indigo-400',
    title: 'Optimize Your Profile',
    desc: 'Profiles with a photo and headline get 3× more views. Add your skills and experience to unlock better AI-powered job matches.',
  },
  {
    icon: <Users className="h-5 w-5" />,
    gradient: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    title: 'Network Actively',
    desc: '85% of jobs are filled through networking. Connect with professionals in your field and engage with their posts regularly.',
  },
  {
    icon: <Zap className="h-5 w-5" />,
    gradient: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    text: 'text-amber-600 dark:text-amber-400',
    title: 'Apply Strategically',
    desc: 'Focus on roles with 80%+ match scores. Tailor your application to each job description to stand out from the crowd.',
  },
]

const CTA_BADGES = ['Free to join', 'No spam ever', '10K+ companies', 'AI-powered matching']

function CareerTipsSection() {
  const rm = useReducedMotion()

  return (
    <div className="mt-10">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="h-5 w-1 rounded-full bg-violet-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Career Tips</h2>
          </div>
          <p className="pl-3.5 text-sm text-slate-500 dark:text-slate-400">
            Insights to accelerate your growth
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {CAREER_TIPS.map((tip, i) => (
          <motion.div
            key={tip.title}
            initial={rm ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            whileHover={rm ? {} : { y: -4, transition: { duration: 0.18 } }}
            className="relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm dark:border-white/10 dark:bg-slate-800"
          >
            {/* gradient top bar */}
            <div className={`h-1 bg-gradient-to-r ${tip.gradient}`} />
            <div className="p-5">
              <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${tip.bg} ${tip.text}`}>
                {tip.icon}
              </div>
              <h3 className="mb-1.5 text-sm font-semibold text-slate-900 dark:text-white">{tip.title}</h3>
              <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">{tip.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function BottomCTA() {
  const rm = useReducedMotion()
  const user = useAuthStore((s) => s.user)

  return (
    <motion.div
      initial={rm ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55 }}
      className="relative mt-10 overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 px-8 py-12 text-center shadow-xl"
    >
      {!rm && (
        <>
          <motion.div
            className="pointer-events-none absolute left-1/4 top-0 h-56 w-56 rounded-full bg-white/10 blur-3xl"
            animate={{ x: [0, 35, -15, 0], y: [0, -25, 12, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="pointer-events-none absolute bottom-0 right-1/4 h-40 w-40 rounded-full bg-purple-300/20 blur-2xl"
            animate={{ x: [0, -22, 12, 0], y: [0, 18, -10, 0] }}
            transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          />
          <motion.div
            className="pointer-events-none absolute right-10 top-6 h-28 w-28 rounded-full bg-indigo-300/15 blur-2xl"
            animate={{ x: [0, 15, -8, 0], y: [0, -12, 8, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          />
        </>
      )}

      <div className="relative z-10">
        <motion.span
          initial={rm ? false : { opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/90"
        >
          <Sparkles className="h-3 w-3" />
          AI-powered matching
        </motion.span>

        <motion.h2
          initial={rm ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.18, duration: 0.4 }}
          className="mt-4 text-2xl font-bold text-white md:text-3xl"
        >
          Your next opportunity is waiting
        </motion.h2>

        <motion.p
          initial={rm ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.28 }}
          className="mx-auto mt-2.5 max-w-md text-sm text-indigo-200"
        >
          Over 10,000 verified jobs from top companies. Apply in minutes using your JobPlus profile.
        </motion.p>

        <motion.div
          initial={rm ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.36 }}
          className="mt-7 flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-indigo-700 shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-slate-50"
          >
            <Briefcase className="h-4 w-4" />
            Explore Jobs
          </Link>
          <Link
            to={user ? `/profile/${user.id}` : '/login'}
            className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/20"
          >
            Complete Your Profile
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        <motion.div
          initial={rm ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.48 }}
          className="mt-7 flex flex-wrap items-center justify-center gap-5"
        >
          {CTA_BADGES.map((badge) => (
            <span key={badge} className="flex items-center gap-1.5 text-xs text-indigo-200">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              {badge}
            </span>
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}

// ── HomePage ──────────────────────────────────────────────────────────────────

export default function HomePage() {
  const user = useAuthStore((s) => s.user)
  const firstName = user?.name?.split(' ')[0] ?? 'there'

  return (
    <PageTransition>
      <div className="page-bg min-h-screen pb-12">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <HeroSection firstName={firstName} />
          <StatsBar />
          <CompanyMarquee />

          <div className="flex items-start gap-6">
            {/* Main column */}
            <div className="min-w-0 flex-1">
              <ActivityFeed />
              <JobsGrid />
            </div>

            {/* Sidebar */}
            <motion.aside
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="hidden w-72 flex-shrink-0 lg:block"
            >
              <div className="sticky top-20 max-h-[calc(100vh-5.5rem)] space-y-4 overflow-y-auto pb-4 pr-1">
                <FollowedCompanies />
                <YourNetwork />
                <CompanySuggestions />
                <PeopleToConnect />
                <TrendingSkills />
              </div>
            </motion.aside>
          </div>

          <CareerTipsSection />
          <BottomCTA />
        </div>
      </div>
    </PageTransition>
  )
}
