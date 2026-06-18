import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Bookmark, MapPin, DollarSign, Clock, ArrowUpRight } from 'lucide-react'
import { BlurFade } from '@/components/magic/BlurFade'
import type { Job } from '@/types'
import { useUIStore } from '@/store/uiStore'

interface JobCardProps {
  job: Job
  onSave?: () => void
  onUnsave?: () => void
  index?: number
  matchScore?: number | null
}

function relativeDate(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  if (diff < 7) return `${diff}d ago`
  if (diff < 30) return `${Math.floor(diff / 7)}w ago`
  return `${Math.floor(diff / 30)}mo ago`
}

function formatSalary(min: number | null, max: number | null): string {
  if (!min && !max) return 'Competitive'
  const fmt = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(0)}K` : `$${n}`
  if (min && max) return `${fmt(min)} – ${fmt(max)}`
  if (min) return `From ${fmt(min)}`
  return `Up to ${fmt(max!)}`
}

const EMPLOYMENT_CONFIG: Record<string, { label: string; classes: string; dot: string }> = {
  FULL_TIME:  { label: 'Full-time',  classes: 'bg-blue-50   text-blue-700   dark:bg-blue-500/10   dark:text-blue-400',   dot: 'bg-blue-500'   },
  PART_TIME:  { label: 'Part-time',  classes: 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400', dot: 'bg-violet-500' },
  CONTRACT:   { label: 'Contract',   classes: 'bg-amber-50  text-amber-700  dark:bg-amber-500/10  dark:text-amber-400',  dot: 'bg-amber-500'  },
  INTERNSHIP: { label: 'Internship', classes: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400', dot: 'bg-emerald-500' },
  REMOTE:     { label: 'Remote',     classes: 'bg-teal-50   text-teal-700   dark:bg-teal-500/10   dark:text-teal-400',   dot: 'bg-teal-500'   },
  FREELANCE:  { label: 'Freelance',  classes: 'bg-rose-50   text-rose-700   dark:bg-rose-500/10   dark:text-rose-400',   dot: 'bg-rose-500'   },
}

const COMPANY_GRADIENTS = [
  'from-indigo-500 to-violet-600',
  'from-emerald-500 to-teal-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-cyan-500 to-blue-600',
  'from-violet-500 to-purple-600',
]

function getGradient(name: string) {
  const idx = name.charCodeAt(0) % COMPANY_GRADIENTS.length
  return COMPANY_GRADIENTS[idx]
}

export function JobCard({ job, onSave, onUnsave, index = 0, matchScore = null }: JobCardProps) {
  const [saved, setSaved] = useState(job.savedByCurrentUser ?? false)
  const [hovered, setHovered] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  const addToast = useUIStore((s) => s.addToast)
  const company  = job.company
  const initials = company?.name?.slice(0, 2).toUpperCase() ?? '??'
  const gradient = getGradient(company?.name ?? 'A')
  const empConfig = EMPLOYMENT_CONFIG[job.employmentType] ?? {
    label: job.employmentType.replace('_', ' '),
    classes: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
    dot: 'bg-slate-400',
  }
  const isNew = job.postedAt
    ? new Date(job.postedAt) > new Date(Date.now() - 3 * 86_400_000)
    : false

  function handleSaveToggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (saved) {
      setSaved(false)
      onUnsave?.()
      addToast('Removed from saved jobs', 'info')
    } else {
      setSaved(true)
      onSave?.()
      addToast('Job saved!', 'success')
    }
  }

  return (
    <BlurFade delay={index * 0.04}>
      <motion.div
        whileHover={prefersReducedMotion ? {} : { y: -3 }}
        transition={{ duration: 0.2 }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
      >
        <Link to={`/jobs/${job.id}`} className="group block">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/10 dark:border-white/[0.07] dark:bg-slate-800/60 dark:hover:border-indigo-500/30 dark:hover:shadow-indigo-500/5">

            {/* Subtle gradient overlay on hover */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/[0.03] to-violet-500/[0.03] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            <div className="relative flex items-start gap-4">
              {/* Company logo */}
              <div className="flex-shrink-0">
                {company?.logoUrl ? (
                  <img
                    src={company.logoUrl}
                    alt={company.name}
                    className="h-12 w-12 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-white/10"
                  />
                ) : (
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-sm font-bold text-white shadow-sm`}>
                    {initials}
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                {/* Title row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {job.title}
                      </h3>
                      {matchScore !== null && (
                        <span className="inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-bold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
                          SmartMatch {matchScore}%
                        </span>
                      )}
                      {isNew && (
                        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                          ✦ New
                        </span>
                      )}
                    </div>
                    {company && (
                      <div className="mt-0.5 flex items-center gap-1">
                        <Link
                          to={`/companies/${company.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                        >
                          {company.name}
                        </Link>
                        {company.verified && (
                          <span className="text-xs text-indigo-400" title="Verified employer">✓</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right actions */}
                  <div className="flex flex-shrink-0 items-center gap-1">
                    <motion.button
                      onClick={handleSaveToggle}
                      whileTap={prefersReducedMotion ? {} : { scale: 0.75 }}
                      title={saved ? 'Remove bookmark' : 'Save job'}
                      aria-label={saved ? 'Unsave job' : 'Save job'}
                      className={`rounded-lg p-1.5 transition-all duration-200 ${
                        saved
                          ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400'
                          : 'text-slate-300 hover:bg-slate-100 hover:text-slate-500 dark:text-slate-600 dark:hover:bg-white/10 dark:hover:text-slate-400'
                      }`}
                    >
                      <Bookmark className={`h-4 w-4 transition-all ${saved ? 'fill-current' : ''}`} />
                    </motion.button>

                    <motion.div
                      animate={prefersReducedMotion ? {} : { opacity: hovered ? 1 : 0, x: hovered ? 0 : -4 }}
                      transition={{ duration: 0.15 }}
                      className="rounded-lg p-1.5 text-indigo-500"
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </motion.div>
                  </div>
                </div>

                {/* Meta row */}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${empConfig.classes}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${empConfig.dot}`} />
                    {empConfig.label}
                  </span>
                  {job.location && (
                    <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <MapPin className="h-3 w-3" />
                      {job.location}
                    </span>
                  )}
                </div>

                {/* Salary + date */}
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-white/[0.05]">
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-800 dark:text-slate-200">
                    <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                    {formatSalary(job.salaryMin, job.salaryMax)}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                    <Clock className="h-3 w-3" />
                    {relativeDate(job.postedAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    </BlurFade>
  )
}
