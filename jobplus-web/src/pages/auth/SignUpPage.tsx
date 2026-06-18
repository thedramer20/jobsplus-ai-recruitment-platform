import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  ArrowRight, Sparkles, Zap, BarChart2, Check, Users,
} from 'lucide-react'
import { PageTransition } from '@/components/layout/PageTransition'
import { register as registerApi } from '@/api/auth'
import { getApiErrorMessage } from '@/api/client'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { Confetti } from '@/components/magic/Confetti'
import { SignUpStep1 } from '@/features/auth/SignUpStep1'
import { SignUpStep2 } from '@/features/auth/SignUpStep2'
import { SignUpStep3 } from '@/features/auth/SignUpStep3'
import type { ProfileBasicsInput } from '@/schemas/authSchemas'
import logoFull from '@/assets/logo/logo-full.svg'

// ── Types ──────────────────────────────────────────────────────────────────────

interface Collected {
  role: 'JOB_SEEKER' | 'EMPLOYER'
  name: string
  email: string
  password: string
}

// ── Icons ──────────────────────────────────────────────────────────────────────

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

// ── Left panel data ────────────────────────────────────────────────────────────

interface BenefitData {
  Icon: React.ElementType
  title: string
  description: string
  iconGradient: string
  accentGradient: string
  floatDir: 1 | -1
}

const BENEFITS: BenefitData[] = [
  {
    Icon: Sparkles,
    title: 'AI-Powered Job Matching',
    description: 'Our algorithm surfaces roles where your skills give you the highest hire chance.',
    iconGradient: 'from-violet-500 to-purple-700',
    accentGradient: 'from-violet-500 to-purple-600',
    floatDir: -1,
  },
  {
    Icon: Zap,
    title: '1-Click Apply',
    description: 'Apply to dozens of jobs in seconds using your saved professional profile.',
    iconGradient: 'from-pink-500 to-rose-600',
    accentGradient: 'from-pink-500 to-rose-500',
    floatDir: 1,
  },
  {
    Icon: BarChart2,
    title: 'Real-Time Application Tracker',
    description: 'See every application status live and get notified when employers respond.',
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

const STEP_LABELS = ['Choose role', 'Your account', 'Your profile']

// ── Sub-components ─────────────────────────────────────────────────────────────

function BenefitCard({ benefit, index, reduced }: {
  benefit: BenefitData
  index: number
  reduced: boolean | null
}) {
  const { Icon } = benefit
  return (
    <motion.div
      initial={reduced ? { opacity: 1 } : { opacity: 0, x: -36 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.55, delay: 0.35 + index * 0.13, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <motion.div
        animate={reduced ? {} : { y: [0, benefit.floatDir * 7, 0] }}
        transition={{ repeat: Infinity, duration: 4 + index * 0.7, ease: 'easeInOut' }}
        className="relative overflow-hidden rounded-xl border border-white/20 bg-white/15 p-4 backdrop-blur-md"
      >
        <div className="absolute inset-y-0 left-0 w-[3px] bg-white/40" />
        <div className="flex items-start gap-3 pl-2">
          <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${benefit.iconGradient} shadow-lg`}>
            <Icon className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-none text-white">{benefit.title}</p>
            <p className="mt-1.5 text-xs leading-relaxed text-white/70">{benefit.description}</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function StepIndicator({ step }: { step: number; reduced?: boolean | null }) {
  return (
    <div className="mb-6 flex items-center justify-center">
      {[1, 2, 3].map((num, i) => (
        <div key={num} className="flex items-center">
          {/* Circle */}
          <motion.div
            animate={{ scale: num === step ? 1.12 : 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="flex flex-col items-center gap-1"
          >
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
              num < step
                ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/30'
                : num === step
                ? 'bg-violet-600 text-white ring-4 ring-violet-500/20 shadow-lg shadow-violet-500/30'
                : 'bg-slate-100 text-slate-400 dark:bg-white/10 dark:text-slate-500'
            }`}>
              {num < step ? <Check className="h-3.5 w-3.5" /> : num}
            </div>
            <span className={`text-[10px] font-medium transition-colors ${
              num === step ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400'
            }`}>
              {STEP_LABELS[i]}
            </span>
          </motion.div>

          {/* Connector line */}
          {i < 2 && (
            <div className="mx-2 mb-4 h-px w-12 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
              <motion.div
                animate={{ width: step > num ? '100%' : '0%' }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                className="h-full bg-gradient-to-r from-violet-500 to-indigo-500"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function SignUpPage() {
  const navigate  = useNavigate()
  const setUser   = useAuthStore((s) => s.setUser)
  const addToast  = useUIStore((s) => s.addToast)
  const [step, setStep]         = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [confetti, setConfetti]   = useState(false)
  const [collected, setCollected] = useState<Partial<Collected>>({})
  const reduced = useReducedMotion()

  function handleStep1(role: 'JOB_SEEKER' | 'EMPLOYER') {
    setCollected((c) => ({ ...c, role }))
    setStep(2)
  }

  function handleStep2(data: { name: string; email: string; password: string }) {
    setCollected((c) => ({ ...c, ...data }))
    setStep(3)
  }

  async function handleStep3(data: ProfileBasicsInput) {
    const full = { ...collected, ...data } as Collected & ProfileBasicsInput
    setIsLoading(true)
    try {
      const res = await registerApi({
        name: full.name,
        email: full.email,
        password: full.password,
        role: full.role,
      })
      setUser(res.user, res.accessToken, res.refreshToken)
      setConfetti(true)
      setTimeout(() => navigate('/welcome'), 1500)
    } catch (err: unknown) {
      const message = getApiErrorMessage(err)
      if (message.toLowerCase().includes('email already registered')) {
        addToast('That email already has an account. Please log in instead.', 'info')
        navigate('/login', { state: { prefillEmail: full.email } })
        return
      }
      addToast(message, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageTransition className="flex min-h-screen">
      <Confetti active={confetti} />

      {/* ════════════════════════════════════════
          LEFT — vibrant gradient panel
      ════════════════════════════════════════ */}
      <div className="relative hidden lg:flex lg:w-[52%] flex-col overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700">

        {/* Dot grid overlay */}
        <div className="banner-dot-pattern pointer-events-none absolute inset-0 opacity-[0.08]" />

        {/* Glow orbs */}
        <motion.div
          animate={reduced ? {} : { x: [0, 50, 0], y: [0, -35, 0] }}
          transition={{ repeat: Infinity, duration: 11, ease: 'easeInOut' }}
          className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-white/15 blur-[90px]"
        />
        <motion.div
          animate={reduced ? {} : { x: [0, -35, 0], y: [0, 45, 0] }}
          transition={{ repeat: Infinity, duration: 14, ease: 'easeInOut', delay: 2.5 }}
          className="pointer-events-none absolute -bottom-28 -right-28 h-[420px] w-[420px] rounded-full bg-purple-300/25 blur-[90px]"
        />
        <motion.div
          animate={reduced ? {} : { scale: [1, 1.35, 1], x: [0, 25, 0] }}
          transition={{ repeat: Infinity, duration: 9, ease: 'easeInOut', delay: 1.5 }}
          className="pointer-events-none absolute top-[35%] left-[15%] h-56 w-56 rounded-full bg-pink-300/20 blur-[70px]"
        />
        <motion.div
          animate={reduced ? {} : { scale: [1, 1.2, 1], y: [0, -25, 0] }}
          transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut', delay: 3.5 }}
          className="pointer-events-none absolute bottom-[20%] right-[5%] h-48 w-48 rounded-full bg-indigo-200/20 blur-[70px]"
        />

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
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
              <Users className="h-3 w-3 text-violet-400" />
              50,000+ professionals hired on JobPlus
            </span>

            <h2 className="text-4xl font-extrabold leading-[1.15] text-white">
              Build your career.{' '}
              <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">
                Land your
              </span>
              <br />
              dream role.
            </h2>
            <p className="mt-3 text-base text-white/75">
              Create your free account and get discovered<br />by 10,000+ top companies worldwide.
            </p>
          </motion.div>

          {/* Benefit cards */}
          <div className="space-y-2.5">
            {BENEFITS.map((b, i) => (
              <BenefitCard key={b.title} benefit={b} index={i} reduced={reduced} />
            ))}
          </div>

          {/* Employer testimonial */}
          <motion.div
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.75 }}
            className="rounded-2xl border border-white/20 bg-white/15 p-4 backdrop-blur-md"
          >
            <p className="text-xs italic leading-relaxed text-white/85">
              "I posted a senior engineer role and had 30 qualified applicants within 48 hours.
              The quality was exceptional."
            </p>
            <div className="mt-3 flex items-center gap-2.5">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-xs font-bold text-white">
                M
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Marcus T.</p>
                <p className="text-xs text-white/60">Engineering Manager · TechCorp</p>
              </div>
              <div className="ml-auto flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg key={i} className="h-3 w-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Social proof footer */}
        <motion.div
          initial={reduced ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="relative z-10 flex items-center gap-4 border-t border-white/15 px-10 py-6"
        >
          <div className="flex -space-x-2.5">
            {AVATAR_GRADIENTS.map((gradient, i) => (
              <div key={i} className={`h-8 w-8 rounded-full bg-gradient-to-br ${gradient} ring-2 ring-white/30`} />
            ))}
          </div>
          <p className="text-xs text-white/70">
            <span className="font-semibold text-white">50,000+</span> professionals hired this year
          </p>
        </motion.div>
      </div>

      {/* ════════════════════════════════════════
          RIGHT — form panel
      ════════════════════════════════════════ */}
      <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-slate-50 px-6 py-12 dark:bg-slate-950 sm:px-10">

        {/* Dot texture */}
        <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.4]">
          <defs>
            <pattern id="signup-dots" x={0} y={0} width={24} height={24} patternUnits="userSpaceOnUse">
              <circle cx={12} cy={12} r={1.5} fill="#cbd5e1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#signup-dots)" />
        </svg>

        {/* Glow behind card */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/10 blur-[100px]" />

        <motion.div
          initial={reduced ? { opacity: 1 } : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="relative z-10 w-full max-w-[460px]"
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

              {/* Header */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Create your account ✨
                </h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Step {step} of 3 · {STEP_LABELS[step - 1]}
                </p>
              </div>

              {/* Step indicator */}
              <StepIndicator step={step} reduced={reduced} />

              {/* Social login (step 1 only) */}
              <AnimatePresence>
                {step === 1 && (
                  <motion.div
                    key="social"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="mb-4 space-y-2.5">
                      <motion.button
                        type="button"
                        whileHover={reduced ? {} : { y: -1 }}
                        whileTap={reduced ? {} : { scale: 0.98 }}
                        onClick={() => addToast('Social signup coming soon', 'info')}
                        className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                      >
                        <GoogleIcon />
                        Continue with Google
                      </motion.button>

                      <motion.button
                        type="button"
                        whileHover={reduced ? {} : { y: -1 }}
                        whileTap={reduced ? {} : { scale: 0.98 }}
                        onClick={() => addToast('Social signup coming soon', 'info')}
                        className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-[#0077B5]/25 bg-[#0077B5]/5 px-4 py-2.5 text-sm font-medium text-[#0077B5] shadow-sm transition-all hover:bg-[#0077B5]/10 hover:shadow-md dark:border-[#0077B5]/20 dark:text-[#38bdf8]"
                      >
                        <LinkedInIcon />
                        Continue with LinkedIn
                      </motion.button>
                    </div>

                    <div className="mb-4 flex items-center gap-3">
                      <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
                      <span className="text-xs text-slate-400 dark:text-slate-500">or create with email</span>
                      <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Step forms */}
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={reduced ? { opacity: 1 } : { opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={reduced ? { opacity: 0 } : { opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                  >
                    <SignUpStep1 onNext={handleStep1} />
                  </motion.div>
                )}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={reduced ? { opacity: 1 } : { opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={reduced ? { opacity: 0 } : { opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                  >
                    <SignUpStep2
                      role={collected.role ?? 'JOB_SEEKER'}
                      onNext={handleStep2}
                      onBack={() => setStep(1)}
                    />
                  </motion.div>
                )}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={reduced ? { opacity: 1 } : { opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={reduced ? { opacity: 0 } : { opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                  >
                    <SignUpStep3
                      role={collected.role ?? 'JOB_SEEKER'}
                      onSubmit={handleStep3}
                      onBack={() => setStep(2)}
                      isLoading={isLoading}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Below-card links */}
          <div className="mt-5 space-y-2 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-violet-600 hover:underline dark:text-violet-400">
                Sign in →
              </Link>
            </p>
            {step === 3 && (
              <p className="flex items-center justify-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                <ArrowRight className="h-3 w-3" />
                You can always complete your profile later
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </PageTransition>
  )
}
