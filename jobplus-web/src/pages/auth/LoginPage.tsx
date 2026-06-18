import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion'
import {
  Eye, EyeOff, ArrowRight, Mail, Lock,
  MapPin, DollarSign, Building2, Sparkles,
} from 'lucide-react'
import { PageTransition } from '@/components/layout/PageTransition'
import { login } from '@/api/auth'
import { loginSchema, type LoginInput } from '@/schemas/authSchemas'
import { useAuthStore } from '@/store/authStore'
import { Role } from '@/types'
import { useUIStore } from '@/store/uiStore'
import logoFull from '@/assets/logo/logo-full.svg'

// ── Static icons ───────────────────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 flex-shrink-0">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 flex-shrink-0" fill="#0077B5">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

// ── Data ───────────────────────────────────────────────────────────────────────

interface RecentHire {
  initials: string
  name: string
  role: string
  company: string
  time: string
  gradient: string
}

const RECENT_HIRES: RecentHire[] = [
  { initials: 'SK', name: 'Sarah K.',  role: 'UX Designer',       company: 'Google', time: '2m ago',  gradient: 'from-pink-400 to-rose-500' },
  { initials: 'MR', name: 'Marcus R.', role: 'Backend Engineer',   company: 'Stripe', time: '5m ago',  gradient: 'from-blue-400 to-indigo-500' },
  { initials: 'PM', name: 'Priya M.',  role: 'Product Manager',    company: 'Meta',   time: '11m ago', gradient: 'from-emerald-400 to-teal-500' },
  { initials: 'JL', name: 'James L.',  role: 'Data Scientist',     company: 'Apple',  time: '18m ago', gradient: 'from-amber-400 to-orange-500' },
]

interface JobCardData {
  title: string
  company: string
  location: string
  salary: string
  match: number
  tag: string
  tagColor: string
  iconGradient: string
  accentGradient: string
  floatDir: 1 | -1
}

const JOB_CARDS: JobCardData[] = [
  {
    title: 'Senior Frontend Engineer',
    company: 'Stripe',
    location: 'Remote',
    salary: '$160K – $200K',
    match: 95,
    tag: 'New',
    tagColor: 'bg-emerald-500/20 text-emerald-400',
    iconGradient: 'from-violet-500 to-purple-700',
    accentGradient: 'from-violet-500 to-purple-600',
    floatDir: -1,
  },
  {
    title: 'Product Designer',
    company: 'Figma',
    location: 'San Francisco',
    salary: '$140K – $170K',
    match: 87,
    tag: 'Hot',
    tagColor: 'bg-orange-500/20 text-orange-400',
    iconGradient: 'from-pink-500 to-rose-600',
    accentGradient: 'from-pink-500 to-rose-500',
    floatDir: 1,
  },
  {
    title: 'ML Engineer',
    company: 'OpenAI',
    location: 'Hybrid',
    salary: '$200K – $280K',
    match: 91,
    tag: 'Urgent',
    tagColor: 'bg-red-500/20 text-red-400',
    iconGradient: 'from-emerald-500 to-teal-600',
    accentGradient: 'from-emerald-500 to-teal-500',
    floatDir: -1,
  },
]

const AVATAR_GRADIENTS = [
  'from-pink-400 to-rose-500',
  'from-violet-400 to-purple-500',
  'from-blue-400 to-indigo-500',
  'from-emerald-400 to-teal-500',
  'from-amber-400 to-orange-500',
]

// ── Sub-components ─────────────────────────────────────────────────────────────

function JobCard({ card, index, reduced }: { card: JobCardData; index: number; reduced: boolean | null }) {
  return (
    <motion.div
      initial={reduced ? { opacity: 1 } : { opacity: 0, x: -36 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.55, delay: 0.35 + index * 0.13, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <motion.div
        animate={reduced ? {} : { y: [0, card.floatDir * 7, 0] }}
        transition={{ repeat: Infinity, duration: 4 + index * 0.7, ease: 'easeInOut' }}
        className="relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-md"
      >
        {/* Left accent bar */}
        <div className={`absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b ${card.accentGradient}`} />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 pl-2">
            <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${card.iconGradient} shadow-lg`}>
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-none text-white">{card.title}</p>
              <p className="mt-0.5 text-xs text-slate-400">{card.company}</p>
            </div>
          </div>

          <div className="flex flex-shrink-0 flex-col items-end gap-1.5">
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-bold text-emerald-400">
              <Sparkles className="h-2.5 w-2.5" />
              {card.match}%
            </span>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${card.tagColor}`}>
              {card.tag}
            </span>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-4 pl-2 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {card.location}
          </span>
          <span className="flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            {card.salary}
          </span>
        </div>
      </motion.div>
    </motion.div>
  )
}

function HireTicker({ reduced }: { reduced: boolean | null }) {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    if (reduced) return
    const t = setInterval(() => setIdx((i) => (i + 1) % RECENT_HIRES.length), 3500)
    return () => clearInterval(t)
  }, [reduced])

  const hire = RECENT_HIRES[idx]

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur-md">
      <div className="mb-3 flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <span className="text-xs font-medium text-slate-400">Recently hired on JobPlus</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={reduced ? { opacity: 1 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? {} : { opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-3"
        >
          <div className={`relative h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-br ${hire.gradient} flex items-center justify-center text-xs font-bold text-white`}>
            {hire.initials}
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#080D1C] bg-emerald-500" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-none text-white">{hire.name} just got hired</p>
            <p className="mt-1 text-xs text-slate-400">
              {hire.role} at <span className="text-slate-300">{hire.company}</span> · {hire.time}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const navigate   = useNavigate()
  const location   = useLocation()
  const setUser    = useAuthStore((s) => s.setUser)
  const addToast   = useUIStore((s) => s.addToast)
  const loginState = location.state as { from?: { pathname?: string }; prefillEmail?: string } | null
  const fromPath   = loginState?.from?.pathname
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading]       = useState(false)
  const reduced = useReducedMotion()

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: loginState?.prefillEmail ?? '',
      password: '',
    },
  })

  async function onSubmit(data: LoginInput) {
    setIsLoading(true)
    try {
      const res = await login(data)
      setUser(res.user, res.accessToken, res.refreshToken)
      // Return the user to the page they were trying to reach, if any.
      if (fromPath && fromPath !== '/login') navigate(fromPath, { replace: true })
      else if (res.user.role === Role.ADMIN)         navigate('/admin/dashboard')
      else if (res.user.role === Role.EMPLOYER) navigate('/employer/dashboard')
      else                                       navigate('/welcome')
    } catch {
      addToast('Invalid email or password', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageTransition className="flex min-h-screen">

      {/* ════════════════════════════════════════
          LEFT — dark immersive panel
      ════════════════════════════════════════ */}
      <div className="relative hidden lg:flex lg:w-[52%] flex-col overflow-hidden bg-[#080D1C]">

        {/* Mesh gradient blobs */}
        <motion.div
          animate={reduced ? {} : { x: [0, 60, 0], y: [0, -40, 0] }}
          transition={{ repeat: Infinity, duration: 12, ease: 'easeInOut' }}
          className="pointer-events-none absolute -top-48 -left-48 h-[600px] w-[600px] rounded-full bg-violet-700/40 blur-[100px]"
        />
        <motion.div
          animate={reduced ? {} : { x: [0, -40, 0], y: [0, 50, 0] }}
          transition={{ repeat: Infinity, duration: 15, ease: 'easeInOut', delay: 3 }}
          className="pointer-events-none absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full bg-blue-700/35 blur-[100px]"
        />
        <motion.div
          animate={reduced ? {} : { scale: [1, 1.4, 1], x: [0, 30, 0] }}
          transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut', delay: 1.5 }}
          className="pointer-events-none absolute top-[30%] left-[20%] h-72 w-72 rounded-full bg-rose-600/20 blur-[80px]"
        />
        <motion.div
          animate={reduced ? {} : { scale: [1, 1.2, 1], y: [0, -30, 0] }}
          transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut', delay: 4 }}
          className="pointer-events-none absolute bottom-[25%] right-[10%] h-64 w-64 rounded-full bg-cyan-600/20 blur-[80px]"
        />

        {/* Subtle grid texture */}
        <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06]">
          <defs>
            <pattern id="left-grid" x={0} y={0} width={40} height={40} patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#left-grid)" />
        </svg>

        {/* Logo */}
        <motion.div
          initial={reduced ? { opacity: 1 } : { opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 p-10 pb-0"
        >
          <img src={logoFull} alt="JobPlus" className="h-9 brightness-0 invert" />
        </motion.div>

        {/* Main content */}
        <div className="relative z-10 flex flex-1 flex-col justify-center gap-5 px-10 py-8">

          {/* Headline */}
          <motion.div
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              AI-Powered Job Matching · Live
            </span>

            <h2 className="text-4xl font-extrabold leading-[1.15] text-white">
              Land your{' '}
              <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">
                dream job.
              </span>
              <br />
              Start today.
            </h2>
            <p className="mt-3 text-base text-slate-400">
              Join millions of professionals who found<br />their next opportunity on JobPlus.
            </p>
          </motion.div>

          {/* Job cards */}
          <div className="space-y-2.5">
            {JOB_CARDS.map((card, i) => (
              <JobCard key={card.title} card={card} index={i} reduced={reduced} />
            ))}
          </div>

          {/* Live ticker */}
          <motion.div
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.75 }}
          >
            <HireTicker reduced={reduced} />
          </motion.div>
        </div>

        {/* Social proof footer */}
        <motion.div
          initial={reduced ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="relative z-10 flex items-center gap-4 px-10 py-6 border-t border-white/5"
        >
          <div className="flex -space-x-2.5">
            {AVATAR_GRADIENTS.map((gradient, i) => (
              <div
                key={i}
                className={`h-8 w-8 rounded-full bg-gradient-to-br ${gradient} ring-2 ring-[#080D1C]`}
              />
            ))}
          </div>
          <p className="text-xs text-slate-400">
            <span className="font-semibold text-white">50,000+</span> professionals hired this year
          </p>
        </motion.div>
      </div>

      {/* ════════════════════════════════════════
          RIGHT — form panel
      ════════════════════════════════════════ */}
      <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-slate-50 px-6 py-12 dark:bg-slate-950 sm:px-10">

        {/* Background texture */}
        <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.4]">
          <defs>
            <pattern id="form-dots" x={0} y={0} width={24} height={24} patternUnits="userSpaceOnUse">
              <circle cx={12} cy={12} r={1.5} fill="#cbd5e1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#form-dots)" />
        </svg>

        {/* Glow behind card */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/10 blur-[100px]" />

        <motion.div
          initial={reduced ? { opacity: 1 } : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="relative z-10 w-full max-w-[420px]"
        >
          {/* Mobile logo */}
          <div className="mb-8 flex justify-center lg:hidden">
            <img src={logoFull} alt="JobPlus" className="h-9 dark:brightness-0 dark:invert" />
          </div>

          {/* Card */}
          <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-violet-100/40 dark:border-white/10 dark:bg-slate-900 dark:shadow-none">

            {/* Rainbow top accent */}
            <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500" />

            <div className="p-8">
              <div className="mb-7">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Welcome back 👋
                </h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Sign in to continue to your account
                </p>
              </div>

              {/* Social buttons */}
              <div className="mb-5 space-y-2.5">
                <motion.button
                  type="button"
                  whileHover={reduced ? {} : { y: -1 }}
                  whileTap={reduced ? {} : { scale: 0.98 }}
                  onClick={() => addToast('Social login coming soon', 'info')}
                  className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/8"
                >
                  <GoogleIcon />
                  Continue with Google
                </motion.button>

                <motion.button
                  type="button"
                  whileHover={reduced ? {} : { y: -1 }}
                  whileTap={reduced ? {} : { scale: 0.98 }}
                  onClick={() => addToast('Social login coming soon', 'info')}
                  className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-[#0077B5]/25 bg-[#0077B5]/5 px-4 py-2.5 text-sm font-medium text-[#0077B5] shadow-sm transition-all hover:bg-[#0077B5]/10 hover:shadow-md dark:border-[#0077B5]/20 dark:text-[#38bdf8]"
                >
                  <LinkedInIcon />
                  Continue with LinkedIn
                </motion.button>
              </div>

              {/* Divider */}
              <div className="mb-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
                <span className="text-xs text-slate-400 dark:text-slate-500">or continue with email</span>
                <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>

                {/* Email */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      autoComplete="email"
                      {...register('email')}
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition-all focus:border-violet-500 focus:bg-white focus:ring-3 focus:ring-violet-500/15 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-white/10"
                    />
                  </div>
                  <AnimatePresence>
                    {errors.email && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-1.5 text-xs text-red-500"
                      >
                        {errors.email.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Password */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      {...register('password')}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-11 text-sm outline-none transition-all focus:border-violet-500 focus:bg-white focus:ring-3 focus:ring-violet-500/15 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-white/10"
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <AnimatePresence>
                    {errors.password && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-1.5 text-xs text-red-500"
                      >
                        {errors.password.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Forgot */}
                <div className="flex items-center justify-end">
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-violet-600 hover:underline dark:text-violet-400"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={reduced ? {} : { scale: 1.01 }}
                  whileTap={reduced ? {} : { scale: 0.97 }}
                  className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition-all hover:shadow-xl hover:shadow-violet-500/40 disabled:opacity-60"
                >
                  {/* Shimmer sweep */}
                  {!isLoading && !reduced && (
                    <motion.div
                      aria-hidden="true"
                      animate={{ x: ['-120%', '220%'] }}
                      transition={{ repeat: Infinity, duration: 2.2, ease: 'linear', repeatDelay: 1 }}
                      className="pointer-events-none absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                    />
                  )}
                  {isLoading ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Signing in…
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </div>

          <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="font-semibold text-violet-600 hover:underline dark:text-violet-400">
              Create one free →
            </Link>
          </p>
        </motion.div>
      </div>
    </PageTransition>
  )
}
