import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, useReducedMotion } from 'framer-motion'
import { PageTransition } from '@/components/layout/PageTransition'
import {
  MapPin, Briefcase, GraduationCap, DollarSign, Calendar, Clock,
  Bookmark, BookmarkCheck, Share2, BadgeCheck, AlertCircle, ArrowLeft,
  Building2, CheckCircle2,
} from 'lucide-react'
import { ApplyModal } from '@/features/jobs/components/ApplyModal'
import { jobKeys } from '@/features/jobs/queryKeys'
import { getJobById, saveJob, unsaveJob } from '@/api/jobs'
import { getProfile } from '@/api/profile'
import { useAuthStore } from '@/store/authStore'
import { Role } from '@/types'
import { JobMatchCard } from '@/features/ai/components/JobMatchCard'

const COMPANY_GRADIENTS = [
  'from-indigo-500 to-violet-600',
  'from-emerald-500 to-teal-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-cyan-500 to-blue-600',
  'from-violet-500 to-purple-600',
]
function getGradient(name: string) {
  return COMPANY_GRADIENTS[name.charCodeAt(0) % COMPANY_GRADIENTS.length]
}

function formatSalary(min: number | null, max: number | null) {
  if (!min && !max) return 'Competitive'
  const fmt = (n: number) => `$${n.toLocaleString()}`
  if (min && max) return `${fmt(min)} – ${fmt(max)}`
  if (min) return `From ${fmt(min)}`
  return `Up to ${fmt(max!)}`
}

function Skeleton() {
  return (
    <div className="page-bg min-h-screen animate-pulse pb-12">
      <div className="h-48 bg-slate-200 dark:bg-white/5" />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex-1 space-y-4">
            <div className="h-8 w-2/3 rounded-xl bg-slate-200 dark:bg-white/10" />
            <div className="h-5 w-1/3 rounded-xl bg-slate-200 dark:bg-white/10" />
            <div className="h-48 rounded-2xl bg-slate-200 dark:bg-white/10" />
          </div>
          <div className="w-full space-y-4 lg:w-72">
            <div className="h-48 rounded-2xl bg-slate-200 dark:bg-white/10" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>()
  const jobId = Number(id)
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [applyOpen, setApplyOpen] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  const { data: job, isLoading } = useQuery({
    queryKey: jobKeys.detail(jobId),
    queryFn: () => getJobById(jobId),
    enabled: !!jobId,
  })

  const [savedOverride, setSavedOverride] = useState<boolean | null>(null)
  const isSaved = savedOverride !== null ? savedOverride : (job?.savedByCurrentUser ?? false)
  const [shareFeedback, setShareFeedback] = useState(false)

  const isSeekerRole = user?.role === Role.JOB_SEEKER
  const [appliedOverride, setAppliedOverride] = useState(false)
  const hasApplied = appliedOverride || (job?.appliedByCurrentUser ?? false)

  // Fetch the current seeker's profile so the apply modal can pre-fill their resume.
  const { data: myProfile } = useQuery({
    queryKey: ['my-profile-resume', user?.id],
    queryFn: () => getProfile(user!.id),
    enabled: !!user?.id && isSeekerRole,
    staleTime: 60_000,
  })

  async function handleShare() {
    const url = window.location.href
    const shareData = {
      title: `${job?.title ?? ''} at ${job?.company?.name ?? ''} — JobPlus`,
      text: (job?.description ?? '').slice(0, 120),
      url,
    }
    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData)
        return
      }
    } catch { /* user cancelled */ }
    try {
      await navigator.clipboard.writeText(url)
    } catch { /* clipboard denied */ }
    setShareFeedback(true)
    setTimeout(() => setShareFeedback(false), 2000)
  }

  const saveMutation = useMutation({
    mutationFn: () => (isSaved ? unsaveJob(jobId) : saveJob(jobId)),
    onMutate: () => setSavedOverride(!isSaved),
    onError: () => setSavedOverride(isSaved),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: jobKeys.detail(jobId) }),
  })

  if (isLoading) return <Skeleton />
  if (!job) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400">Job not found.</p>
      </div>
    )
  }

  const company  = job.company
  const initials = company?.name?.slice(0, 2).toUpperCase() ?? '??'
  const gradient = getGradient(company?.name ?? 'A')
  const isClosed = job.status === 'CLOSED' || job.status === 'REMOVED'
  const isSeeker = user?.role === Role.JOB_SEEKER

  const EMP_COLORS: Record<string, string> = {
    FULL_TIME:  'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
    PART_TIME:  'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400',
    CONTRACT:   'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
    INTERNSHIP: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
    REMOTE:     'bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400',
  }

  return (
    <PageTransition>
      <div className="page-bg min-h-screen pb-16">

        {/* Hero header */}
        <div className="relative overflow-hidden border-b border-slate-200/60 bg-white dark:border-white/[0.06] dark:bg-slate-900">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/50 dark:from-indigo-950/50 dark:via-slate-900 dark:to-violet-950/30" />
          </div>
          <div className="relative mx-auto max-w-6xl px-4 py-8">
            <Link
              to="/jobs"
              className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to jobs
            </Link>

            {isClosed && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-500/20 dark:bg-amber-900/20 dark:text-amber-400"
              >
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                This position is no longer accepting applications.
              </motion.div>
            )}

            <div className="flex items-start gap-5">
              {/* Company logo */}
              <div className={`flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-lg font-bold text-white shadow-md`}>
                {initials}
              </div>

              <div className="flex-1">
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
                  {job.title}
                </h1>
                {company && (
                  <div className="mt-1 flex items-center gap-1.5">
                    <Link
                      to={`/companies/${company.id}`}
                      className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      {company.name}
                    </Link>
                    {company.verified && (
                      <BadgeCheck className="h-4 w-4 text-indigo-500" />
                    )}
                  </div>
                )}

                {/* Meta badges */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {job.location && (
                    <span className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                      <MapPin className="h-3.5 w-3.5" />
                      {job.location}
                    </span>
                  )}
                  <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${EMP_COLORS[job.employmentType] ?? 'bg-slate-100 text-slate-600'}`}>
                    <Briefcase className="h-3.5 w-3.5" />
                    {job.employmentType.replace('_', ' ')}
                  </span>
                  <span className="flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 dark:bg-violet-500/10 dark:text-violet-400">
                    <GraduationCap className="h-3.5 w-3.5" />
                    {job.experienceLevel}
                  </span>
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <DollarSign className="h-3.5 w-3.5" />
                    {formatSalary(job.salaryMin, job.salaryMax)}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    Posted {new Date(job.postedAt).toLocaleDateString()}
                  </span>
                  {job.deadline && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Deadline {new Date(job.deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex flex-col gap-6 lg:flex-row">

            {/* ── Main content ── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="min-w-0 flex-1 space-y-5"
            >
              {/* Job description */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/[0.07] dark:bg-slate-800/60">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-500/10">
                    <Briefcase className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </span>
                  Job Description
                </h2>
                <div className="space-y-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {job.description.split('\n').map((line, i) => (
                    line.trim() ? (
                      <p key={i} className={line.startsWith('•') || line.startsWith('-') ? 'flex gap-2' : ''}>
                        {(line.startsWith('•') || line.startsWith('-')) && (
                          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-indigo-400" />
                        )}
                        {line.replace(/^[•\-]\s*/, '')}
                      </p>
                    ) : <br key={i} />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* ── Right sidebar ── */}
            <motion.aside
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="w-full lg:w-72 lg:flex-shrink-0"
            >
              <div className="sticky top-20 space-y-4">

                {/* Apply card */}
                <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-white/[0.07] dark:bg-slate-800/60">
                  <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />
                  <div className="p-5">
                    {isSeeker && hasApplied ? (
                      <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 py-3.5 text-sm font-bold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                        <CheckCircle2 className="h-4 w-4" />
                        Applied
                      </div>
                    ) : isSeeker && !isClosed ? (
                      <motion.button
                        type="button"
                        onClick={() => setApplyOpen(true)}
                        whileHover={prefersReducedMotion ? {} : { scale: 1.01 }}
                        whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
                        className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 transition-shadow hover:shadow-xl hover:shadow-indigo-500/40"
                      >
                        {!prefersReducedMotion && (
                          <motion.div
                            aria-hidden="true"
                            animate={{ x: ['-120%', '220%'] }}
                            transition={{ repeat: Infinity, duration: 2.5, ease: 'linear', repeatDelay: 1.2 }}
                            className="pointer-events-none absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          />
                        )}
                        Apply Now
                      </motion.button>
                    ) : isClosed ? (
                      <button disabled className="w-full cursor-not-allowed rounded-xl bg-slate-100 py-3.5 text-sm font-semibold text-slate-400 dark:bg-white/5 dark:text-slate-500">
                        Applications Closed
                      </button>
                    ) : null}

                    <motion.button
                      onClick={() => saveMutation.mutate()}
                      disabled={saveMutation.isPending}
                      whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
                      className={`mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition-all ${
                        isSaved
                          ? 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-transparent dark:text-slate-300 dark:hover:bg-white/5'
                      }`}
                    >
                      {isSaved
                        ? <BookmarkCheck className="h-4 w-4 fill-current" />
                        : <Bookmark className="h-4 w-4" />
                      }
                      {isSaved ? 'Saved' : 'Save Job'}
                    </motion.button>

                    <motion.button
                      type="button"
                      onClick={handleShare}
                      whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
                      className={`mt-2 flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition-all ${
                        shareFeedback
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-transparent dark:text-slate-300 dark:hover:bg-white/5'
                      }`}
                    >
                      <Share2 className="h-4 w-4" />
                      {shareFeedback ? 'Link copied!' : 'Share'}
                    </motion.button>
                  </div>
                </div>

                {isSeeker && <JobMatchCard jobId={jobId} />}

                {/* Company card */}
                {company && (
                  <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-white/[0.07] dark:bg-slate-800/60">
                    <h3 className="mb-4 text-sm font-bold text-slate-900 dark:text-white">About the company</h3>
                    <div className="flex items-center gap-3">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-sm font-bold text-white shadow-sm`}>
                        {initials}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{company.name}</p>
                        {company.industry && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">{company.industry}</p>
                        )}
                      </div>
                    </div>
                    {company.description && (
                      <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                        {company.description}
                      </p>
                    )}
                    <Link
                      to={`/companies/${company.id}`}
                      className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      <Building2 className="h-3.5 w-3.5" />
                      View company profile →
                    </Link>
                  </div>
                )}

                {/* Quick facts */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-white/[0.07] dark:bg-slate-800/60">
                  <h3 className="mb-4 text-sm font-bold text-slate-900 dark:text-white">Quick Facts</h3>
                  <div className="space-y-3">
                    {[
                      { icon: DollarSign, label: 'Salary', value: formatSalary(job.salaryMin, job.salaryMax), color: 'text-emerald-500' },
                      { icon: Briefcase, label: 'Type', value: job.employmentType.replace('_', ' '), color: 'text-blue-500' },
                      { icon: GraduationCap, label: 'Level', value: job.experienceLevel, color: 'text-violet-500' },
                      ...(job.location ? [{ icon: MapPin, label: 'Location', value: job.location, color: 'text-rose-500' }] : []),
                    ].map(({ icon: Icon, label, value, color }) => (
                      <div key={label} className="flex items-center gap-3">
                        <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-50 dark:bg-white/5 ${color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-[11px] text-slate-400">{label}</p>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.aside>
          </div>
        </div>

        <ApplyModal
          jobId={jobId}
          jobTitle={job.title}
          isOpen={applyOpen}
          onClose={() => setApplyOpen(false)}
          seekerResumeUrl={myProfile?.resumeUrl ?? null}
          onApplied={() => {
            setAppliedOverride(true)
            queryClient.invalidateQueries({ queryKey: jobKeys.detail(jobId) })
          }}
        />
      </div>
    </PageTransition>
  )
}
