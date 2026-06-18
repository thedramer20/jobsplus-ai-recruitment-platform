import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { PageTransition } from '@/components/layout/PageTransition'
import {
  ArrowLeft, MessageSquare, CheckCircle2, XCircle, CalendarCheck, Award,
  Eye, ChevronDown, ChevronUp, Users, FileText, Loader2,
} from 'lucide-react'
import { updateApplicationStatus, getJobById } from '@/api/jobs'
import { getSmartMatchCandidates } from '@/api/smartMatch'
import { startConversation, type ConversationSummary } from '@/api/messages'
import { Avatar } from '@/components/ui/Avatar'
import { jobKeys } from '@/features/jobs/queryKeys'
import { ApplicationStatus } from '@/types'
import type { Application, SmartMatchResult } from '@/types'

const ALL_STAGES = [
  { status: null,                         label: 'All',         color: 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300' },
  { status: ApplicationStatus.APPLIED,    label: 'Applied',     color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  { status: ApplicationStatus.REVIEWED,   label: 'Reviewed',    color: 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300' },
  { status: ApplicationStatus.SHORTLISTED,label: 'Shortlisted', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300' },
  { status: ApplicationStatus.INTERVIEW,  label: 'Interview',   color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  { status: ApplicationStatus.OFFER,      label: 'Offer',       color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  { status: ApplicationStatus.REJECTED,   label: 'Rejected',    color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
]

const STATUS_BADGE: Record<string, string> = {
  APPLIED:     'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  REVIEWED:    'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300',
  SHORTLISTED: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  INTERVIEW:   'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  REJECTED:    'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  OFFER:       'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
}

interface QuickActionProps {
  app: Application
  match?: SmartMatchResult
  onUpdate: (appId: number, status: string) => void
  pending: boolean
}

function QuickActions({ app, onUpdate, pending }: QuickActionProps) {
  const s = app.status
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {s === ApplicationStatus.APPLIED && (
        <button type="button"
          onClick={() => onUpdate(app.id, ApplicationStatus.REVIEWED)}
          disabled={pending}
          className="flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-200 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/20"
        >
          <Eye className="h-3 w-3" /> Review
        </button>
      )}
      {(s === ApplicationStatus.APPLIED || s === ApplicationStatus.REVIEWED) && (
        <button type="button"
          onClick={() => onUpdate(app.id, ApplicationStatus.SHORTLISTED)}
          disabled={pending}
          className="flex items-center gap-1 rounded-lg bg-cyan-100 px-2.5 py-1 text-xs font-medium text-cyan-700 transition hover:bg-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300"
        >
          <CheckCircle2 className="h-3 w-3" /> Shortlist
        </button>
      )}
      {s === ApplicationStatus.SHORTLISTED && (
        <button type="button"
          onClick={() => onUpdate(app.id, ApplicationStatus.INTERVIEW)}
          disabled={pending}
          className="flex items-center gap-1 rounded-lg bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700 transition hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300"
        >
          <CalendarCheck className="h-3 w-3" /> Schedule Interview
        </button>
      )}
      {s === ApplicationStatus.INTERVIEW && (
        <button type="button"
          onClick={() => onUpdate(app.id, ApplicationStatus.OFFER)}
          disabled={pending}
          className="flex items-center gap-1 rounded-lg bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 transition hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300"
        >
          <Award className="h-3 w-3" /> Make Offer
        </button>
      )}
      {s !== ApplicationStatus.REJECTED && s !== ApplicationStatus.OFFER && (
        <button type="button"
          onClick={() => onUpdate(app.id, ApplicationStatus.REJECTED)}
          disabled={pending}
          className="flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1 text-xs font-medium text-red-500 transition hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400"
        >
          <XCircle className="h-3 w-3" /> Reject
        </button>
      )}
      {s === ApplicationStatus.REJECTED && (
        <button type="button"
          onClick={() => onUpdate(app.id, ApplicationStatus.REVIEWED)}
          disabled={pending}
          className="flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-200 dark:bg-white/10 dark:text-slate-300"
        >
          Reconsider
        </button>
      )}
    </div>
  )
}

function ApplicantCard({ app, match, onUpdate, pending }: QuickActionProps) {
  const [expanded, setExpanded] = useState(false)
  const [msgError, setMsgError] = useState<string | null>(null)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const seeker = app.seeker

  const messageMutation = useMutation({
    mutationFn: () => startConversation(app.seekerId),
    onSuccess: (convo) => {
      setMsgError(null)
      queryClient.setQueryData<ConversationSummary[]>(['conversations'], (old = []) =>
        old.find((c) => c.id === convo.id) ? old : [convo, ...old],
      )
      navigate(`/messages?convo=${convo.id}`)
    },
    onError: () => {
      setMsgError('Could not open conversation. Make sure the backend is running.')
    },
  })

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm transition hover:shadow-md dark:border-white/10 dark:bg-white/5"
    >
      <div className="flex flex-wrap items-start gap-3 p-4 sm:flex-nowrap sm:gap-4 sm:p-5">
        {/* Avatar */}
        <Avatar
          src={seeker?.avatarUrl ?? null}
          name={seeker?.name ?? '?'}
          size="lg"
          className="flex-shrink-0"
        />

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-slate-900 dark:text-white">{seeker?.name ?? 'Unknown'}</p>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STATUS_BADGE[app.status] ?? ''}`}>
              {app.status}
            </span>
          </div>
          {seeker?.headline && (
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{seeker.headline}</p>
          )}
          <p className="mt-1 text-xs text-slate-400">
            Applied {new Date(app.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
          {match && (
            <div className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50/70 p-3 dark:border-indigo-500/20 dark:bg-indigo-500/10">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-500">SmartMatch</p>
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-indigo-700 shadow-sm dark:bg-slate-900 dark:text-indigo-300">
                  {match.finalScore}%
                </span>
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">{match.verdict}</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{match.summary}</p>
              {match.missingSkills.length > 0 && (
                <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
                  Missing skills: {match.missingSkills.slice(0, 4).join(', ')}
                </p>
              )}
            </div>
          )}

          {/* Quick actions */}
          <div className="mt-3">
            <QuickActions app={app} onUpdate={onUpdate} pending={pending} />
          </div>
        </div>

        {/* Right actions */}
        <div className="flex flex-shrink-0 flex-col items-end gap-1">
          <div className="flex items-center gap-2">
          <button
            type="button"
            title={`Message ${seeker?.name ?? 'applicant'}`}
            disabled={messageMutation.isPending}
            onClick={() => { setMsgError(null); messageMutation.mutate() }}
            className="rounded-xl border border-slate-200 p-2 text-slate-400 transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary disabled:opacity-50 dark:border-white/10"
          >
            {messageMutation.isPending
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <MessageSquare className="h-4 w-4" />}
          </button>
          {app.coverLetter && (
            <button type="button"
              onClick={() => setExpanded((v) => !v)}
              className="flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-500 transition hover:border-primary/30 hover:text-primary dark:border-white/10"
            >
              <FileText className="h-3.5 w-3.5" />
              {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          )}
          </div>
          {msgError && (
            <p className="text-right text-xs text-red-500">{msgError}</p>
          )}
        </div>
      </div>

      {/* Cover letter expand */}
      <AnimatePresence>
        {expanded && app.coverLetter && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-slate-100 dark:border-white/10"
          >
            <div className="bg-slate-50 p-5 dark:bg-white/5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Cover Letter</p>
              <p className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">{app.coverLetter}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function ApplicantsPage() {
  const { id } = useParams<{ id: string }>()
  const jobId = Number(id)
  const queryClient = useQueryClient()
  const [activeStage, setActiveStage] = useState<ApplicationStatus | null>(null)

  const { data: job } = useQuery({
    queryKey: jobKeys.detail(jobId),
    queryFn: () => getJobById(jobId),
    enabled: !!jobId,
  })

  const { data, isLoading } = useQuery({
    queryKey: jobKeys.applicants(jobId, 0),
    queryFn: () => getSmartMatchCandidates(jobId, 0),
    enabled: !!jobId,
  })

  const statusMutation = useMutation({
    mutationFn: ({ appId, status }: { appId: number; status: string }) =>
      updateApplicationStatus(appId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: jobKeys.applicants(jobId, 0) }),
  })

  const rankedCandidates = data?.content ?? []
  const allApplicants = rankedCandidates.map((item) => item.application)
  const filtered = activeStage
    ? rankedCandidates.filter((item) => item.application.status === activeStage)
    : rankedCandidates

  const stageCounts = ALL_STAGES.map((s) => ({
    ...s,
    count: s.status ? allApplicants.filter((a) => a.status === s.status).length : allApplicants.length,
  }))

  return (
    <PageTransition className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/20 dark:from-slate-950 dark:to-indigo-950/10">
      <div className="mx-auto max-w-5xl px-4 py-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Link
            to="/employer/jobs"
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> Back to My Jobs
          </Link>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {job?.title ?? 'Applicants'}
              </h1>
              <div className="mt-1 flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-400" />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {data?.totalElements ?? 0} total application{(data?.totalElements ?? 0) !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stage filter tabs */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="mb-6 flex flex-wrap gap-2"
        >
          {stageCounts.map(({ status, label, color, count }) => (
            <button type="button"
              key={label}
              onClick={() => setActiveStage(status)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium transition ${
                activeStage === status
                  ? `${color} ring-2 ring-primary/30`
                  : 'bg-white text-slate-600 shadow-sm hover:bg-slate-50 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10'
              }`}
            >
              {label}
              <span className="rounded-full bg-white/50 px-1.5 py-0.5 text-xs font-bold text-slate-700 dark:bg-black/20 dark:text-slate-200">
                {count}
              </span>
            </button>
          ))}
        </motion.div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl bg-white p-5 dark:bg-white/5 h-28" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="mb-4 text-6xl">📭</div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {activeStage ? `No ${activeStage.toLowerCase()} applicants` : 'No applications yet'}
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {activeStage ? 'Try a different filter' : 'Applications will appear here once candidates apply.'}
            </p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div className="space-y-3" layout>
              {filtered.map((app) => (
                <ApplicantCard
                  key={app.application.id}
                  app={app.application}
                  match={app.match}
                  onUpdate={(appId, status) => statusMutation.mutate({ appId, status })}
                  pending={statusMutation.isPending}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </PageTransition>
  )
}
