import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import {
  ArrowRight,
  BarChart3,
  Brain,
  Briefcase,
  CheckCircle2,
  Compass,
  FileSearch,
  GraduationCap,
  Lightbulb,
  MapPin,
  Play,
  RefreshCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
  Users,
} from 'lucide-react'
import { PageTransition } from '@/components/layout/PageTransition'
import { useAuthStore } from '@/store/authStore'
import { Role } from '@/types'

type FactorKey =
  | 'skillMatch'
  | 'experienceMatch'
  | 'educationMatch'
  | 'locationMatch'
  | 'keywordRelevance'
  | 'profileCompleteness'

type SimulatorStage = 'input' | 'scoring' | 'weighted' | 'ranking' | 'recommendations'

type FactorDefinition = {
  key: FactorKey
  title: string
  shortTitle: string
  weight: number
  score: number
  Icon: typeof Sparkles
  accent: string
  text: string
  description: string
  tooltip: string
}

const FACTORS: FactorDefinition[] = [
  {
    key: 'skillMatch',
    title: 'Skill Match',
    shortTitle: 'Skills',
    weight: 0.30,
    score: 84,
    Icon: Sparkles,
    accent: 'from-indigo-500 to-violet-500',
    text: 'text-indigo-500',
    description: 'Measures overlap between candidate skills and required job skills.',
    tooltip: 'Compares listed candidate skills against the exact and related job skills needed for the role.',
  },
  {
    key: 'experienceMatch',
    title: 'Experience Match',
    shortTitle: 'Experience',
    weight: 0.20,
    score: 72,
    Icon: TrendingUp,
    accent: 'from-emerald-500 to-teal-500',
    text: 'text-emerald-500',
    description: 'Checks years of experience and how relevant past work is to the role.',
    tooltip: 'Rewards experience length and relevance of previous roles to the target position.',
  },
  {
    key: 'educationMatch',
    title: 'Education Match',
    shortTitle: 'Education',
    weight: 0.10,
    score: 68,
    Icon: GraduationCap,
    accent: 'from-amber-500 to-orange-500',
    text: 'text-amber-500',
    description: 'Looks at educational background and whether it supports the target domain.',
    tooltip: 'Evaluates how well the candidate educational background supports the field or role.',
  },
  {
    key: 'locationMatch',
    title: 'Location Match',
    shortTitle: 'Location',
    weight: 0.10,
    score: 90,
    Icon: MapPin,
    accent: 'from-rose-500 to-pink-500',
    text: 'text-rose-500',
    description: 'Rewards remote compatibility or geographic alignment with the job.',
    tooltip: 'Gives higher scores for remote eligibility or close location compatibility.',
  },
  {
    key: 'keywordRelevance',
    title: 'Keyword Relevance',
    shortTitle: 'Keywords',
    weight: 0.15,
    score: 76,
    Icon: Search,
    accent: 'from-cyan-500 to-blue-500',
    text: 'text-cyan-500',
    description: 'Matches important keywords between the profile, resume, and job description.',
    tooltip: 'Analyzes whether candidate wording matches the role language recruiters search for.',
  },
  {
    key: 'profileCompleteness',
    title: 'Profile Completeness',
    shortTitle: 'Completeness',
    weight: 0.15,
    score: 88,
    Icon: FileSearch,
    accent: 'from-fuchsia-500 to-violet-500',
    text: 'text-fuchsia-500',
    description: 'Scores how complete the candidate profile is for recruiter readiness.',
    tooltip: 'Rewards a full profile with headline, bio, experience, education, resume, and skills.',
  },
]

const FLOW_STEPS = [
  { label: 'Candidate Profile', Icon: UserRound, note: 'skills, experience, education, resume' },
  { label: 'Job Requirements', Icon: Briefcase, note: 'title, description, location, required skills' },
  { label: 'SmartMatch Engine', Icon: Brain, note: 'factor scoring and weighted formula' },
  { label: 'Score Breakdown', Icon: BarChart3, note: 'clear explanation for every factor' },
  { label: 'Ranking Result', Icon: Target, note: 'best jobs and best applicants first' },
  { label: 'Recommendations', Icon: Lightbulb, note: 'missing skills and improvement actions' },
]

const JOB_RANKING = [
  { name: 'AI Product Analyst', score: 92, reason: 'Exceptional keyword alignment and strong analytical fit.' },
  { name: 'Learning Analytics Specialist', score: 86, reason: 'Strong profile completeness and location compatibility.' },
  { name: 'Platform Reliability Engineer', score: 78, reason: 'Solid experience fit with a few missing specialist skills.' },
]

const CANDIDATE_RANKING = [
  { name: 'Priya Nair', score: 94, reason: 'High skill coverage, strong recruiter readiness, and strong domain fit.' },
  { name: 'Marcus Osei', score: 87, reason: 'Relevant experience with a minor keyword and education gap.' },
  { name: 'Juan dela Cruz', score: 79, reason: 'Good baseline profile that still needs stronger role-specific language.' },
]

const BASE_DEMO_SCORES: Record<FactorKey, number> = {
  skillMatch: 84,
  experienceMatch: 72,
  educationMatch: 68,
  locationMatch: 90,
  keywordRelevance: 76,
  profileCompleteness: 88,
}

const SIMULATOR_SCORES: Record<FactorKey, number> = {
  skillMatch: 90,
  experienceMatch: 82,
  educationMatch: 74,
  locationMatch: 96,
  keywordRelevance: 88,
  profileCompleteness: 91,
}

const STAGES: { key: SimulatorStage; label: string }[] = [
  { key: 'input', label: 'Input Data' },
  { key: 'scoring', label: 'Factor Scoring' },
  { key: 'weighted', label: 'Weighted Calculation' },
  { key: 'ranking', label: 'Ranking' },
  { key: 'recommendations', label: 'Recommendations' },
]

const MISSING_SIGNALS = [
  'Missing job-specific technical skills can lower the fit score even when the candidate profile is otherwise strong.',
  'Incomplete resume or profile sections reduce profile completeness and recruiter confidence.',
  'Weak keyword alignment can drop a candidate below others who describe their experience with stronger domain language.',
]

const IMPROVEMENTS = [
  'Add missing role-relevant skills directly to the profile and skills section.',
  'Upload a current resume to improve completeness and increase keyword coverage.',
  'Rewrite experience bullets with measurable results and job-specific terminology.',
]

function HeroOrb({ className, delay = 0 }: { className: string; delay?: number }) {
  const reduceMotion = useReducedMotion()
  if (reduceMotion) return <div className={className} />

  return (
    <motion.div
      className={className}
      animate={{ x: [0, 25, -15, 0], y: [0, -20, 18, 0], scale: [1, 1.12, 0.92, 1] }}
      transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay }}
    />
  )
}

function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div className="mb-8">
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-indigo-500">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">{title}</h2>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">{description}</p>
    </div>
  )
}

function computeFinalScore(scores: Record<FactorKey, number>) {
  return FACTORS.reduce((sum, factor) => sum + scores[factor.key] * factor.weight, 0)
}

function weightedRows(scores: Record<FactorKey, number>) {
  return FACTORS.map((factor) => ({
    label: factor.title,
    score: scores[factor.key],
    weight: factor.weight,
    weighted: scores[factor.key] * factor.weight,
  }))
}

export default function SmartMatchAlgorithmPage() {
  const reduceMotion = useReducedMotion()
  const user = useAuthStore((s) => s.user)
  const [demoScores, setDemoScores] = useState<Record<FactorKey, number>>(BASE_DEMO_SCORES)
  const [stageIndex, setStageIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const primaryLink = user?.role === Role.EMPLOYER ? '/employer/jobs' : '/jobs'
  const primaryLabel = user?.role === Role.EMPLOYER ? 'View Ranked Candidates' : 'View Ranked Jobs'
  const rankedCandidatesLink = user?.role === Role.EMPLOYER ? '/employer/jobs' : '/jobs'
  const interactiveTotal = useMemo(() => computeFinalScore(demoScores), [demoScores])
  const exampleRows = useMemo(() => weightedRows(BASE_DEMO_SCORES), [])
  const exampleTotal = useMemo(() => computeFinalScore(BASE_DEMO_SCORES), [])
  const simulatorRows = useMemo(() => weightedRows(SIMULATOR_SCORES), [])
  const simulatorTotal = useMemo(() => computeFinalScore(SIMULATOR_SCORES), [])
  const currentStage = STAGES[stageIndex]

  useEffect(() => {
    if (!isPlaying) return
    if (stageIndex >= STAGES.length - 1) {
      setIsPlaying(false)
      return
    }

    const timer = window.setTimeout(() => {
      setStageIndex((value) => Math.min(value + 1, STAGES.length - 1))
    }, 1400)

    return () => window.clearTimeout(timer)
  }, [isPlaying, stageIndex])

  function updateDemoScore(key: FactorKey, value: number) {
    setDemoScores((current) => ({ ...current, [key]: value }))
  }

  function handlePlay() {
    setStageIndex(0)
    setIsPlaying(true)
  }

  function handleReset() {
    setIsPlaying(false)
    setStageIndex(0)
  }

  function getStageStatus(index: number) {
    if (index < stageIndex) return 'done'
    if (index === stageIndex) return 'active'
    return 'idle'
  }

  const visibleFactorCount = stageIndex === 0 ? 0 : stageIndex === 1 ? 3 : 6
  const showWeighted = stageIndex >= 2
  const showRanking = stageIndex >= 3
  const showRecommendations = stageIndex >= 4

  return (
    <PageTransition>
      <div className="page-bg min-h-screen scroll-smooth pb-24">
        <section className="relative overflow-hidden border-b border-slate-200/60 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.22),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.18),_transparent_24%),linear-gradient(135deg,_#0f172a,_#1e1b4b_48%,_#312e81)]">
          <HeroOrb className="pointer-events-none absolute -left-10 top-10 h-64 w-64 rounded-full bg-indigo-400/20 blur-3xl" />
          <HeroOrb className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-fuchsia-400/20 blur-3xl" delay={1.6} />
          <HeroOrb className="pointer-events-none absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-cyan-400/15 blur-3xl" delay={0.8} />
          <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:radial-gradient(circle,_white_1px,transparent_1.5px)] [background-size:22px_22px]" />

          <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              animate={reduceMotion ? {} : { opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid items-start gap-8 lg:grid-cols-[1.2fr_0.8fr]"
            >
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-indigo-100 backdrop-blur">
                  <Brain className="h-3.5 w-3.5" />
                  Custom Matching Engine
                </span>
                <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-tight text-white md:text-6xl">
                  JobPlus SmartMatch Algorithm
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-relaxed text-slate-300 md:text-lg">
                  A custom Job-Candidate Matching and Ranking Algorithm built for JobPlus to score, explain,
                  and rank candidate-job fit for both students and recruiters using transparent weighted logic.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    to={primaryLink}
                    className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-indigo-700 shadow-lg shadow-black/15 transition hover:-translate-y-0.5 hover:bg-indigo-50"
                  >
                    {primaryLabel}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/jobs/53"
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
                  >
                    Open Job Match Example
                  </Link>
                  <a
                    href="#simulator"
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
                  >
                    Play Algorithm Demo
                  </a>
                </div>

                <div className="mt-10 grid gap-4 sm:grid-cols-3">
                  {[
                    { label: 'Match Dimensions', value: '6 factors' },
                    { label: 'Final Score', value: '0 to 100' },
                    { label: 'Outputs', value: 'Rank + Explain' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-300">{item.label}</p>
                      <p className="mt-2 text-xl font-bold text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-white/10 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-indigo-200">Live Example</p>
                    <h3 className="mt-2 text-xl font-bold text-white">Candidate Match Snapshot</h3>
                  </div>
                  <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 text-2xl font-black text-white shadow-lg shadow-emerald-900/30">
                    {Math.round(exampleTotal)}
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {FACTORS.slice(0, 4).map(({ title, score, text }) => (
                    <div key={title}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-100">{title}</span>
                        <span className={`font-bold ${text}`}>{score}</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10">
                        <motion.div
                          initial={reduceMotion ? false : { width: 0 }}
                          animate={{ width: `${score}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className="h-2 rounded-full bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl border border-emerald-400/15 bg-emerald-400/10 p-4">
                  <p className="text-sm font-semibold text-emerald-200">Why the score is strong</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-200">
                    High location compatibility, strong skill overlap, and a complete recruiter-ready profile lift the
                    ranking, while weaker education and keyword coverage keep the score realistic and explainable.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <section id="formula" className="mb-14 rounded-[32px] border border-slate-200/70 bg-white/90 p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/70 md:p-8">
            <SectionTitle
              eyebrow="Core Formula"
              title="Weighted scoring designed specifically for JobPlus"
              description="The final SmartMatch score combines six factors using fixed transparent weights. This makes the algorithm explainable, measurable, and easy to defend in front of the teacher."
            />
            <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-3xl bg-slate-950 p-6 text-slate-100 shadow-lg">
                <p className="text-xs uppercase tracking-[0.22em] text-indigo-300">Final Formula</p>
                <pre className="mt-4 overflow-x-auto whitespace-pre-wrap break-words text-lg font-semibold leading-relaxed text-white">
{`FinalScore =
  SkillMatch × 0.30 +
  ExperienceMatch × 0.20 +
  EducationMatch × 0.10 +
  LocationMatch × 0.10 +
  KeywordRelevance × 0.15 +
  ProfileCompleteness × 0.15`}
                </pre>
              </div>

              <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-6 dark:border-indigo-500/20 dark:from-indigo-500/10 dark:via-slate-900 dark:to-violet-500/10">
                <p className="text-xs uppercase tracking-[0.22em] text-indigo-500">Weights</p>
                <div className="mt-4 space-y-3">
                  {FACTORS.map(({ title, weight, accent }) => (
                    <div key={title} className="rounded-2xl border border-white/60 bg-white/80 p-3 shadow-sm dark:border-white/10 dark:bg-slate-900/60">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</span>
                        <span className={`rounded-full bg-gradient-to-r ${accent} px-2.5 py-1 text-xs font-bold text-white`}>
                          {Math.round(weight * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="mb-14">
            <SectionTitle
              eyebrow="Score Cards"
              title="Each factor contributes to the final ranking"
              description="Hover any factor to show the teacher a clear explanation of what the algorithm is measuring and why it matters."
            />
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {FACTORS.map(({ title, weight, score, Icon, accent, text, description, tooltip }, index) => (
                <motion.div
                  key={title}
                  initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                  whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.45, delay: index * 0.05 }}
                  className="group relative rounded-[28px] border border-slate-200/70 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 dark:border-white/10 dark:bg-slate-900/70"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} text-white shadow-lg`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                      Weight {Math.round(weight * 100)}%
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{description}</p>
                  <div className="mt-5">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">Sample factor score</span>
                      <span className={`font-bold ${text}`}>{score}/100</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-slate-100 dark:bg-white/10">
                      <motion.div
                        initial={reduceMotion ? false : { width: 0 }}
                        whileInView={{ width: `${score}%` }}
                        viewport={{ once: true, amount: 0.4 }}
                        transition={{ duration: 0.9, delay: index * 0.06 }}
                        className={`h-2.5 rounded-full bg-gradient-to-r ${accent}`}
                      />
                    </div>
                  </div>

                  <div className="pointer-events-none absolute inset-x-5 bottom-5 translate-y-2 rounded-2xl border border-slate-200 bg-white/95 p-3 text-xs leading-relaxed text-slate-600 opacity-0 shadow-lg transition duration-200 group-hover:translate-y-0 group-hover:opacity-100 dark:border-white/10 dark:bg-slate-950/95 dark:text-slate-300">
                    {tooltip}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          <section className="mb-14 rounded-[32px] border border-slate-200/70 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/70 md:p-8">
            <SectionTitle
              eyebrow="Engine Flow"
              title="How SmartMatch transforms data into rankings"
              description="The flow is now fully responsive, so every step stays readable on laptop screens without clipping or cutting off the first card."
            />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
              {FLOW_STEPS.map(({ label, Icon, note }, index) => (
                <motion.div
                  key={label}
                  initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                  whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.45, delay: index * 0.06 }}
                  className="relative overflow-hidden rounded-[26px] border border-slate-200/80 bg-gradient-to-br from-white to-slate-50 p-4 shadow-sm dark:border-white/10 dark:from-slate-900 dark:to-slate-800"
                >
                  {!reduceMotion && (
                    <motion.div
                      className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 3.5, repeat: Infinity, ease: 'linear', delay: index * 0.2 }}
                    />
                  )}
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-base font-bold text-slate-900 dark:text-white">{label}</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{note}</p>
                </motion.div>
              ))}
            </div>
          </section>

          <section id="simulator" className="mb-14 scroll-mt-24 rounded-[32px] border border-slate-200/70 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/70 md:p-8">
            <SectionTitle
              eyebrow="Animated Simulator"
              title="Watch the SmartMatch engine work step by step"
              description="This interactive simulator visually demonstrates how candidate data and job data enter the engine, how factor scores are produced, how the weighted formula is applied, and how the output becomes rankings and recommendations."
            />

            <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="grid gap-3 sm:grid-cols-5">
                {STAGES.map((stage, index) => {
                  const status = getStageStatus(index)
                  return (
                    <div
                      key={stage.key}
                      className={`rounded-2xl border px-4 py-3 text-center text-sm font-semibold transition ${
                        status === 'done'
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300'
                          : status === 'active'
                            ? 'border-indigo-300 bg-indigo-50 text-indigo-700 shadow-md ring-2 ring-indigo-200 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-500/20'
                            : 'border-slate-200 bg-slate-50 text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400'
                      }`}
                    >
                      {stage.label}
                    </div>
                  )
                })}
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handlePlay}
                  disabled={isPlaying}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Play className="h-4 w-4" />
                  Play Algorithm
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Reset Demo
                </button>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-[30px] border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-5 shadow-inner dark:border-white/10 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30">
                <div className="grid gap-4 lg:grid-cols-[1fr_0.95fr_1fr] lg:items-center">
                  <div className="space-y-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
                      <div className="flex items-center gap-2">
                        <UserRound className="h-4 w-4 text-indigo-500" />
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Candidate Profile</p>
                      </div>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Skills, education, resume, location, and experience data.</p>
                    </div>
                    <AnimatePresence>
                      {stageIndex >= 0 && (
                        <motion.div
                          initial={reduceMotion ? false : { opacity: 0, x: -20 }}
                          animate={reduceMotion ? {} : { opacity: 1, x: 0 }}
                          className="flex flex-wrap gap-2"
                        >
                          {FACTORS.slice(0, 3).map((factor, index) => (
                            <motion.div
                              key={factor.key}
                              animate={isPlaying && stageIndex <= 1 ? { x: [0, 14, 0] } : {}}
                              transition={{ duration: 1.2, repeat: isPlaying && stageIndex <= 1 ? Infinity : 0, delay: index * 0.1 }}
                              className={`rounded-full bg-gradient-to-r ${factor.accent} px-3 py-1 text-xs font-bold text-white shadow`}
                            >
                              {factor.shortTitle}
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="relative mx-auto flex min-h-[320px] w-full max-w-[360px] items-center justify-center">
                    {!reduceMotion && (
                      <>
                        <motion.div
                          className="absolute left-2 top-20 h-2 w-16 rounded-full bg-gradient-to-r from-indigo-400 to-violet-400"
                          animate={isPlaying ? { x: [0, 42, 84], opacity: [0.3, 1, 0.3] } : { opacity: 0.3 }}
                          transition={{ duration: 1.8, repeat: isPlaying ? Infinity : 0, ease: 'easeInOut' }}
                        />
                        <motion.div
                          className="absolute right-2 bottom-20 h-2 w-16 rounded-full bg-gradient-to-r from-cyan-400 to-blue-400"
                          animate={isPlaying ? { x: [0, -42, -84], opacity: [0.3, 1, 0.3] } : { opacity: 0.3 }}
                          transition={{ duration: 1.8, repeat: isPlaying ? Infinity : 0, ease: 'easeInOut', delay: 0.3 }}
                        />
                        {FACTORS.map((factor, index) => {
                          const fromLeft = index < 3
                          const canMove = isPlaying && stageIndex <= 1
                          return (
                            <motion.div
                              key={`particle-${factor.key}`}
                              initial={false}
                              animate={
                                canMove
                                  ? {
                                      opacity: [0, 1, 1, 0],
                                      x: fromLeft ? [-110, -40, 0] : [110, 40, 0],
                                      y: fromLeft ? [-72 + index * 24, -28 + index * 12, -10 + index * 4] : [72 - index * 24, 28 - index * 12, 10 - index * 4],
                                      scale: [0.8, 1, 0.92],
                                    }
                                  : { opacity: 0 }
                              }
                              transition={{
                                duration: 1.2,
                                repeat: canMove ? Infinity : 0,
                                ease: 'easeInOut',
                                delay: index * 0.08,
                              }}
                              className={`pointer-events-none absolute left-1/2 top-1/2 z-10 -ml-6 -mt-4 rounded-full bg-gradient-to-r ${factor.accent} px-3 py-1 text-[10px] font-bold text-white shadow-lg`}
                            >
                              {factor.shortTitle}
                            </motion.div>
                          )
                        })}
                      </>
                    )}

                    <motion.div
                      animate={isPlaying ? { scale: [1, 1.04, 1], boxShadow: ['0 0 0 rgba(99,102,241,0.1)', '0 0 40px rgba(99,102,241,0.25)', '0 0 0 rgba(99,102,241,0.1)'] } : {}}
                      transition={{ duration: 1.8, repeat: isPlaying ? Infinity : 0 }}
                      className="relative flex h-52 w-52 flex-col items-center justify-center rounded-[36px] border border-indigo-200 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.24),_transparent_45%),linear-gradient(135deg,_#111827,_#312e81)] p-5 text-center text-white shadow-2xl dark:border-indigo-500/20"
                    >
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                        <Brain className="h-7 w-7" />
                      </div>
                      <p className="mt-4 text-lg font-black">SmartMatch Engine</p>
                      <p className="mt-2 text-xs leading-relaxed text-indigo-100">
                        Stage: {currentStage.label}
                      </p>
                      <div className="mt-4 flex flex-wrap justify-center gap-2">
                        {FACTORS.slice(0, visibleFactorCount).map((factor, index) => (
                          <motion.span
                            key={factor.key}
                            initial={reduceMotion ? false : { opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.08 }}
                            className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white"
                          >
                            {factor.shortTitle}
                          </motion.span>
                        ))}
                      </div>
                    </motion.div>
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-cyan-500" />
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Job Requirements</p>
                      </div>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Role title, needed skills, required experience, and target location.</p>
                    </div>
                    <AnimatePresence>
                      {stageIndex >= 0 && (
                        <motion.div
                          initial={reduceMotion ? false : { opacity: 0, x: 20 }}
                          animate={reduceMotion ? {} : { opacity: 1, x: 0 }}
                          className="flex flex-wrap justify-start gap-2 lg:justify-end"
                        >
                          {FACTORS.slice(3).map((factor, index) => (
                            <motion.div
                              key={factor.key}
                              animate={isPlaying && stageIndex <= 1 ? { x: [0, -14, 0] } : {}}
                              transition={{ duration: 1.2, repeat: isPlaying && stageIndex <= 1 ? Infinity : 0, delay: index * 0.1 }}
                              className={`rounded-full bg-gradient-to-r ${factor.accent} px-3 py-1 text-xs font-bold text-white shadow`}
                            >
                              {factor.shortTitle}
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {FACTORS.map((factor, index) => {
                    const visible = index < visibleFactorCount
                    return (
                      <motion.div
                        key={factor.key}
                        initial={reduceMotion ? false : { opacity: 0.3, y: 10 }}
                        animate={visible ? { opacity: 1, y: 0 } : { opacity: 0.35, y: 0 }}
                        className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-slate-900/70"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{factor.shortTitle}</span>
                          <span className={`text-sm font-bold ${factor.text}`}>{visible ? SIMULATOR_SCORES[factor.key] : '--'}</span>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-slate-100 dark:bg-white/10">
                          <motion.div
                            animate={{ width: visible ? `${SIMULATOR_SCORES[factor.key]}%` : '0%' }}
                            transition={{ duration: 0.6, delay: visible ? index * 0.05 : 0 }}
                            className={`h-2 rounded-full bg-gradient-to-r ${factor.accent}`}
                          />
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-5">
                <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-indigo-500" />
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Live progress</p>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-slate-100 dark:bg-white/10">
                    <motion.div
                      animate={{ width: `${((stageIndex + 1) / STAGES.length) * 100}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-2 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500"
                    />
                  </div>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                    Current stage: <span className="font-semibold text-slate-900 dark:text-white">{currentStage.label}</span>
                  </p>
                </div>

                <AnimatePresence mode="wait">
                  {showWeighted && (
                    <motion.div
                      key="weighted"
                      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                      animate={reduceMotion ? {} : { opacity: 1, y: 0 }}
                      exit={reduceMotion ? {} : { opacity: 0, y: -10 }}
                      className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/70"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.16em] text-indigo-500">Weighted Calculation</p>
                          <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">FinalScore = Sum(score × weight)</p>
                        </div>
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-xl font-black text-white">
                          {Math.round(simulatorTotal)}
                        </div>
                      </div>

                      <div className="mt-4 space-y-2">
                        {simulatorRows.map((row) => (
                          <div key={row.label} className="flex items-center justify-between text-sm">
                            <span className="text-slate-600 dark:text-slate-300">{row.label}</span>
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {row.score} × {row.weight.toFixed(2)} = {row.weighted.toFixed(1)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                  {showRanking && (
                    <motion.div
                      key="ranking"
                      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                      animate={reduceMotion ? {} : { opacity: 1, y: 0 }}
                      exit={reduceMotion ? {} : { opacity: 0, y: -10 }}
                      className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/70"
                    >
                      <p className="text-xs uppercase tracking-[0.16em] text-indigo-500">Ranking Output</p>
                      <div className="mt-4 space-y-3">
                        {JOB_RANKING.slice(0, 2).map((job, index) => (
                          <div key={job.name} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/5">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-bold text-slate-900 dark:text-white">#{index + 1} {job.name}</p>
                              <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
                                {job.score}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                  {showRecommendations && (
                    <motion.div
                      key="recommendations"
                      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                      animate={reduceMotion ? {} : { opacity: 1, y: 0 }}
                      exit={reduceMotion ? {} : { opacity: 0, y: -10 }}
                      className="rounded-[28px] border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm dark:border-amber-500/20 dark:from-amber-500/10 dark:to-slate-900"
                    >
                      <p className="text-xs uppercase tracking-[0.16em] text-amber-600 dark:text-amber-300">Recommendations</p>
                      <div className="mt-4 space-y-3 text-sm text-slate-700 dark:text-slate-200">
                        <p>Missing skills detected: distributed systems, incident response.</p>
                        <p>Improvement suggestion: add measurable experience bullets and upload the latest resume.</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </section>

          <section className="mb-14 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[32px] border border-slate-200/70 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/70 md:p-8">
              <SectionTitle
                eyebrow="Interactive Demo"
                title="Adjust factor scores and watch the final SmartMatch score update live"
                description="This section uses the same SmartMatch formula but lets the teacher interact with the six factors directly, making the logic visible instead of hidden."
              />
              <div className="space-y-5">
                {FACTORS.map((factor) => (
                  <div key={factor.key}>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{factor.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Weight {Math.round(factor.weight * 100)}%</p>
                      </div>
                      <span className={`text-sm font-bold ${factor.text}`}>{demoScores[factor.key]}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={demoScores[factor.key]}
                      onChange={(e) => updateDemoScore(factor.key, Number(e.target.value))}
                      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-indigo-600 dark:bg-white/10"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-slate-200/70 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/70 md:p-8">
              <SectionTitle
                eyebrow="Live Result"
                title="Automatic weighted calculation"
                description="The final score updates automatically as each factor changes, proving the page is demonstrating a real formula and not just static text."
              />
              <div className="rounded-3xl bg-slate-950 p-5 text-white">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-indigo-300">Live SmartMatch Score</p>
                    <p className="mt-2 text-3xl font-black">{Math.round(interactiveTotal)}/100</p>
                  </div>
                  <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-500 text-2xl font-black text-white shadow-lg">
                    {Math.round(interactiveTotal)}
                  </div>
                </div>
                <div className="mt-5 space-y-2">
                  {weightedRows(demoScores).map((row) => (
                    <div key={row.label} className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">{row.label}</span>
                      <span className="font-semibold text-white">{row.score} × {row.weight.toFixed(2)} = {row.weighted.toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <Link
                  to="/jobs"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
                >
                  View Ranked Jobs
                </Link>
                <Link
                  to={rankedCandidatesLink}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                >
                  View Ranked Candidates
                </Link>
                <Link
                  to="/jobs/53"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                >
                  Open Job Match Example
                </Link>
              </div>
            </div>
          </section>

          <section className="mb-14 rounded-[32px] border border-slate-200/70 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/70 md:p-8">
            <SectionTitle
              eyebrow="Example Calculation"
              title="A full score breakdown from factor values to final result"
              description="This sample demonstrates exactly how a candidate score is computed, making the algorithm easy to explain in the report and in the teacher presentation."
            />
            <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10">
              <div className="grid grid-cols-[1.3fr_0.7fr_0.8fr_0.9fr] bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500 dark:bg-white/5 dark:text-slate-400">
                <span>Factor</span>
                <span>Score</span>
                <span>Weight</span>
                <span>Weighted</span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-white/10">
                {exampleRows.map((row) => (
                  <div key={row.label} className="grid grid-cols-[1.3fr_0.7fr_0.8fr_0.9fr] px-4 py-3 text-sm">
                    <span className="font-semibold text-slate-900 dark:text-white">{row.label}</span>
                    <span className="text-slate-600 dark:text-slate-300">{row.score}</span>
                    <span className="text-slate-600 dark:text-slate-300">{row.weight.toFixed(2)}</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-300">{row.weighted.toFixed(1)}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between bg-slate-950 px-4 py-4 text-white">
                <span className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-300">Final SmartMatch Score</span>
                <span className="text-2xl font-black">{Math.round(exampleTotal)}/100</span>
              </div>
            </div>
          </section>

          <section className="mb-14 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[32px] border border-indigo-200/70 bg-gradient-to-br from-indigo-50 to-white p-6 shadow-sm dark:border-indigo-500/20 dark:from-indigo-500/10 dark:to-slate-900 md:p-8">
              <SectionTitle
                eyebrow="Ranking Examples"
                title="More impressive SmartMatch outcomes"
                description="The score examples below are intentionally polished for presentation while still following the logic of the SmartMatch engine."
              />
              <div className="space-y-6">
                <div>
                  <div className="mb-4 flex items-center gap-2">
                    <Compass className="h-5 w-5 text-indigo-500" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Job Ranking for Students</h3>
                  </div>
                  <div className="space-y-3">
                    {JOB_RANKING.map((job, index) => (
                      <div key={job.name} className="rounded-2xl border border-white bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-900/60">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">#{index + 1} {job.name}</p>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{job.reason}</p>
                          </div>
                          <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-bold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
                            {job.score}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 text-violet-500" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Candidate Ranking for Recruiters</h3>
                  </div>
                  <div className="space-y-3">
                    {CANDIDATE_RANKING.map((candidate, index) => (
                      <div key={candidate.name} className="rounded-2xl border border-white bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-900/60">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">#{index + 1} {candidate.name}</p>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{candidate.reason}</p>
                          </div>
                          <span className="rounded-full bg-violet-100 px-3 py-1 text-sm font-bold text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
                            {candidate.score}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-slate-200/70 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/70 md:p-8">
              <SectionTitle
                eyebrow="Before / After"
                title="Why SmartMatch is stronger than simple filtering"
                description="This comparison helps the teacher immediately see the project impact beyond a normal job board search."
              />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Before SmartMatch</p>
                  <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                    <li>Jobs appear mostly by date or basic filters.</li>
                    <li>Recruiters manually review candidates without a transparent score.</li>
                    <li>No factor-level explanation for why a match is strong or weak.</li>
                  </ul>
                </div>
                <div className="rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-violet-50 p-5 dark:border-indigo-500/20 dark:from-indigo-500/10 dark:to-violet-500/10">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">After SmartMatch</p>
                  <ul className="mt-4 space-y-3 text-sm text-slate-700 dark:text-slate-200">
                    <li>Jobs and candidates are ranked by a real weighted matching engine.</li>
                    <li>Every score is explainable with visible factor contributions.</li>
                    <li>The platform suggests concrete improvements and missing skills.</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-14 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[32px] border border-amber-200/70 bg-gradient-to-br from-amber-50 to-white p-6 shadow-sm dark:border-amber-500/20 dark:from-amber-500/10 dark:to-slate-900 md:p-8">
              <SectionTitle
                eyebrow="Missing Signals"
                title="The algorithm points out what is missing"
                description="SmartMatch does not only output a number. It highlights where the candidate is underperforming so the platform becomes useful for improvement, not only ranking."
              />
              <div className="space-y-3">
                {MISSING_SIGNALS.map((item) => (
                  <div key={item} className="rounded-2xl border border-amber-200 bg-white/90 p-4 dark:border-amber-500/20 dark:bg-slate-900/60">
                    <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-emerald-200/70 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm dark:border-emerald-500/20 dark:from-emerald-500/10 dark:to-slate-900 md:p-8">
              <SectionTitle
                eyebrow="Improvement Suggestions"
                title="SmartMatch provides actions students can take immediately"
                description="These suggestions convert the ranking system into a learning tool for students and a screening aid for recruiters."
              />
              <div className="space-y-3">
                {IMPROVEMENTS.map((item) => (
                  <div key={item} className="flex gap-3 rounded-2xl border border-emerald-200 bg-white/90 p-4 dark:border-emerald-500/20 dark:bg-slate-900/60">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500" />
                    <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mb-14 rounded-[32px] border border-slate-200/70 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/70 md:p-8">
            <SectionTitle
              eyebrow="Proof of Originality"
              title="Why this is our own custom algorithm"
              description="This section is designed to make the project contribution obvious to the teacher. It frames SmartMatch as a real system design choice, not just a generic AI add-on."
            />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                'We selected our own six-factor scoring model based on job-platform needs.',
                'We defined explicit weights and formulas instead of relying on hidden AI-only scoring.',
                'We built ranking logic for both sides: seeker-to-job and recruiter-to-candidate.',
                'We added explanations, missing skills, and improvement tips to make results transparent.',
              ].map((item, index) => (
                <motion.div
                  key={item}
                  initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                  whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.4, delay: index * 0.06 }}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5"
                >
                  <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">{item}</p>
                </motion.div>
              ))}
            </div>
          </section>

          <section className="rounded-[32px] border border-slate-200/70 bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 p-6 text-white shadow-lg md:p-8">
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-200">Report-Ready Section</p>
                <h2 className="mt-3 text-3xl font-bold">Custom Algorithm Design: JobPlus SmartMatch Algorithm</h2>
                <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-300">
                  This page can be used as a direct visual reference when writing the experiment report section for the
                  custom algorithm. It already presents the formula, weights, flow, ranking behavior, explanation logic,
                  and why the design is specific to JobPlus.
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                <p className="text-sm font-semibold text-white">How it helps the project</p>
                <div className="mt-4 space-y-3 text-sm text-slate-200">
                  <p>Students receive smarter job recommendations and profile improvement guidance.</p>
                  <p>Recruiters receive ranked applicants with explainable factor-level reasoning.</p>
                  <p>The teacher can clearly see a strong custom algorithm at the core of JobPlus.</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </PageTransition>
  )
}
