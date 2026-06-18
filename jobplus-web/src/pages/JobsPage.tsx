import { useState, useEffect, useRef, useCallback } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { PageTransition } from '@/components/layout/PageTransition'
import { Search, SlidersHorizontal, X, Briefcase, DollarSign, Clock } from 'lucide-react'
import { JobCard } from '@/features/jobs/components/JobCard'
import { JobCardSkeleton } from '@/features/jobs/components/JobCardSkeleton'
import { jobKeys } from '@/features/jobs/queryKeys'
import { getJobs, saveJob, unsaveJob } from '@/api/jobs'
import { getSmartMatchJobs } from '@/api/smartMatch'
import type { JobFilterParams } from '@/api/jobs'
import { PageContainer } from '@/components/layout/PageContainer'
import { EmptyState } from '@/components/ui/EmptyState'
import { useAuthStore } from '@/store/authStore'
import { Role } from '@/types'

const EMPLOYMENT_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'REMOTE']
const EXPERIENCE_LEVELS = ['ENTRY', 'MID', 'SENIOR', 'LEAD', 'MANAGER']
const POSTED_OPTIONS = [
  { label: 'Last 24 hours', value: 1 },
  { label: 'Last week',     value: 7 },
  { label: 'Last month',    value: 30 },
]

const EMP_COLORS: Record<string, string> = {
  FULL_TIME:  'from-indigo-500 to-violet-500',
  PART_TIME:  'from-amber-500 to-orange-500',
  CONTRACT:   'from-teal-500 to-emerald-500',
  INTERNSHIP: 'from-pink-500 to-rose-500',
  REMOTE:     'from-cyan-500 to-blue-500',
}

const EXP_COLORS: Record<string, string> = {
  ENTRY:   'from-emerald-500 to-teal-500',
  MID:     'from-blue-500 to-indigo-500',
  SENIOR:  'from-violet-500 to-purple-500',
  LEAD:    'from-amber-500 to-orange-500',
  MANAGER: 'from-rose-500 to-pink-500',
}

function labelCase(s: string) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function PillToggle({
  label,
  active,
  gradient,
  onClick,
}: {
  label: string
  active: boolean
  gradient: string
  onClick: () => void
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      className={`relative rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
        active
          ? `bg-gradient-to-r ${gradient} text-white shadow-md`
          : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10'
      }`}
    >
      {label}
    </motion.button>
  )
}

function SectionLabel({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <div className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-50 text-indigo-500 dark:bg-indigo-500/10">
        {icon}
      </div>
      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
        {children}
      </p>
    </div>
  )
}

export default function JobsPage() {
  const prefersReducedMotion = useReducedMotion()
  const user = useAuthStore((s) => s.user)
  const useSmartMatch = user?.role === Role.JOB_SEEKER

  const [keyword, setKeyword]             = useState('')
  const [location, setLocation]           = useState('')
  const [searchInput, setSearchInput]     = useState('')
  const [locationInput, setLocationInput] = useState('')
  const [empTypes, setEmpTypes]           = useState<string[]>([])
  const [expLevels, setExpLevels]         = useState<string[]>([])
  const [salaryMin, setSalaryMin]         = useState('')
  const [salaryMax, setSalaryMax]         = useState('')
  const [remote, setRemote]               = useState(false)
  const [postedDays, setPostedDays]       = useState<number | undefined>()
  const [sidebarOpen, setSidebarOpen]     = useState(false)

  const filters: JobFilterParams = {
    keyword:         keyword   || undefined,
    location:        location  || undefined,
    employmentType:  empTypes.length === 1 ? empTypes[0] : undefined,
    experienceLevel: expLevels.length === 1 ? expLevels[0] : undefined,
    salaryMin:       salaryMin ? Number(salaryMin) : undefined,
    salaryMax:       salaryMax ? Number(salaryMax) : undefined,
    remote:          remote    || undefined,
    postedWithinDays: postedDays,
    size: 20,
  }

  const smartMatchQuery = useInfiniteQuery({
    queryKey: [...jobKeys.list(filters), 'smart-match'],
    queryFn: ({ pageParam }) => getSmartMatchJobs({ ...filters, page: pageParam as number }),
    enabled: useSmartMatch,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const next = lastPage.currentPage + 1
      return next < lastPage.totalPages ? next : undefined
    },
  })

  const standardQuery = useInfiniteQuery({
    queryKey: [...jobKeys.list(filters), 'default'],
    queryFn: ({ pageParam }) => getJobs({ ...filters, page: pageParam as number }),
    enabled: !useSmartMatch,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const next = lastPage.currentPage + 1
      return next < lastPage.totalPages ? next : undefined
    },
  })

  const activeQuery = useSmartMatch ? smartMatchQuery : standardQuery
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error, refetch } = activeQuery

  const rankedJobs = smartMatchQuery.data?.pages.flatMap((p) => p.content) ?? []
  const jobs = useSmartMatch
    ? rankedJobs.map((item) => item.job)
    : (standardQuery.data?.pages.flatMap((p) => p.content) ?? [])
  const total = data?.pages[0]?.totalElements ?? 0

  const loaderRef  = useRef<HTMLDivElement>(null)
  const onIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage()
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  )

  useEffect(() => {
    const el = loaderRef.current
    if (!el) return
    const observer = new IntersectionObserver(onIntersect, { rootMargin: '200px' })
    observer.observe(el)
    return () => observer.disconnect()
  }, [onIntersect])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setKeyword(searchInput)
    setLocation(locationInput)
  }

  function toggleEmpType(t: string) {
    setEmpTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))
  }

  function toggleExpLevel(l: string) {
    setExpLevels((prev) => (prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]))
  }

  function clearFilters() {
    setEmpTypes([])
    setExpLevels([])
    setSalaryMin('')
    setSalaryMax('')
    setRemote(false)
    setPostedDays(undefined)
  }

  const hasActiveFilters =
    empTypes.length > 0 || expLevels.length > 0 || salaryMin || salaryMax || remote || postedDays

  const activeFilterCount =
    empTypes.length + expLevels.length + (remote ? 1 : 0) + (salaryMin || salaryMax ? 1 : 0) + (postedDays ? 1 : 0)

  const listVariants = {
    hidden: {},
    show: { transition: { staggerChildren: prefersReducedMotion ? 0 : 0.06 } },
  }
  const itemVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 16 },
    show:   { opacity: 1, y: 0 },
  }

  return (
    <PageTransition>
      <div className="page-bg min-h-screen pb-12">

        {/* ── Hero / search ── */}
        <div className="relative overflow-hidden border-b border-slate-200/60 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 px-4 pb-8 pt-10 dark:from-indigo-800 dark:via-indigo-900 dark:to-violet-900">
          {/* subtle bg circles */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 left-1/3 h-48 w-48 rounded-full bg-violet-500/20 blur-2xl" />

          <div className="relative mx-auto max-w-6xl">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 shadow-lg backdrop-blur-sm ring-1 ring-white/30">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">Find Your Next Role</h1>
                <p className="mt-0.5 text-sm text-indigo-200">
                  {isLoading ? 'Searching…' : (
                    <span>
                      <span className="font-semibold text-white">{total.toLocaleString()}</span>
                      {' '}{useSmartMatch ? 'SmartMatch-ranked opportunities' : 'opportunities available'}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <form onSubmit={handleSearch} className="flex gap-2.5">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Job title, keyword…"
                  className="h-12 w-full rounded-xl border-0 bg-white pl-10 pr-4 text-sm text-slate-900 shadow-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-white/60"
                />
              </div>
              <input
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                placeholder="Location"
                className="hidden h-12 w-44 rounded-xl border-0 bg-white px-4 text-sm text-slate-900 shadow-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-white/60 sm:block"
              />
              <motion.button
                type="submit"
                whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
                className="h-12 rounded-xl bg-white px-7 text-sm font-bold text-indigo-700 shadow-xl transition hover:bg-indigo-50"
              >
                Search
              </motion.button>
              <motion.button
                type="button"
                onClick={() => setSidebarOpen((o) => !o)}
                whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
                className="relative flex h-12 items-center gap-1.5 rounded-xl bg-white/15 px-4 text-sm font-medium text-white shadow-lg backdrop-blur-sm transition hover:bg-white/25 lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-amber-900">
                    {activeFilterCount}
                  </span>
                )}
              </motion.button>
            </form>
          </div>
        </div>

        {/* Active filter chips */}
        <AnimatePresence>
          {hasActiveFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-b border-slate-200/60 bg-white/80 backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/60"
            >
              <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active:</span>
                {empTypes.map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => toggleEmpType(t)}
                    className="flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300"
                  >
                    {labelCase(t)} <X className="h-3 w-3" />
                  </button>
                ))}
                {expLevels.map((l) => (
                  <button
                    type="button"
                    key={l}
                    onClick={() => toggleExpLevel(l)}
                    className="flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-700 transition hover:bg-violet-200 dark:bg-violet-900/40 dark:text-violet-300"
                  >
                    {labelCase(l)} <X className="h-3 w-3" />
                  </button>
                ))}
                {remote && (
                  <button
                    type="button"
                    onClick={() => setRemote(false)}
                    className="flex items-center gap-1 rounded-full bg-teal-100 px-2.5 py-1 text-xs font-semibold text-teal-700 transition hover:bg-teal-200 dark:bg-teal-900/40 dark:text-teal-300"
                  >
                    Remote only <X className="h-3 w-3" />
                  </button>
                )}
                {(salaryMin || salaryMax) && (
                  <button
                    type="button"
                    onClick={() => { setSalaryMin(''); setSalaryMax('') }}
                    className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300"
                  >
                    ${salaryMin || '0'}k–${salaryMax || '∞'}k <X className="h-3 w-3" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={clearFilters}
                  className="ml-auto rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-500 transition hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40"
                >
                  Clear all
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <PageContainer size="lg">
          <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-7">

            {/* ── Filter sidebar ── */}
            <aside className={`${sidebarOpen ? 'block' : 'hidden'} mb-5 w-full lg:mb-0 lg:block`}>
              <div className="sticky top-20 max-h-[calc(100vh-5.5rem)] overflow-y-auto rounded-2xl border border-slate-200/70 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900/80">
                {/* sidebar header */}
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-indigo-500" />
                    <h3 className="font-bold text-slate-900 dark:text-white">Filters</h3>
                    {activeFilterCount > 0 && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-bold text-white">
                        {activeFilterCount}
                      </span>
                    )}
                  </div>
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-500 transition hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="space-y-6 p-5">
                  {/* Employment type */}
                  <div>
                    <SectionLabel icon={<Briefcase className="h-3 w-3" />}>
                      Employment Type
                    </SectionLabel>
                    <div className="flex flex-wrap gap-2">
                      {EMPLOYMENT_TYPES.map((t) => (
                        <PillToggle
                          key={t}
                          label={labelCase(t)}
                          active={empTypes.includes(t)}
                          gradient={EMP_COLORS[t] ?? 'from-indigo-500 to-violet-500'}
                          onClick={() => toggleEmpType(t)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Experience level */}
                  <div className="border-t border-slate-100 pt-5 dark:border-white/10">
                    <SectionLabel icon={<Search className="h-3 w-3" />}>
                      Experience Level
                    </SectionLabel>
                    <div className="flex flex-wrap gap-2">
                      {EXPERIENCE_LEVELS.map((l) => (
                        <PillToggle
                          key={l}
                          label={labelCase(l)}
                          active={expLevels.includes(l)}
                          gradient={EXP_COLORS[l] ?? 'from-indigo-500 to-violet-500'}
                          onClick={() => toggleExpLevel(l)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Salary range */}
                  <div className="border-t border-slate-100 pt-5 dark:border-white/10">
                    <SectionLabel icon={<DollarSign className="h-3 w-3" />}>
                      Salary Range (K)
                    </SectionLabel>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">$</span>
                        <input
                          type="number"
                          value={salaryMin}
                          onChange={(e) => setSalaryMin(e.target.value)}
                          placeholder="Min"
                          className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-7 pr-2 text-sm font-medium text-slate-700 transition focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                        />
                      </div>
                      <div className="h-px w-4 flex-shrink-0 bg-slate-300 dark:bg-slate-600" />
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">$</span>
                        <input
                          type="number"
                          value={salaryMax}
                          onChange={(e) => setSalaryMax(e.target.value)}
                          placeholder="Max"
                          className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-7 pr-2 text-sm font-medium text-slate-700 transition focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Remote only */}
                  <div className="border-t border-slate-100 pt-5 dark:border-white/10">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={remote}
                      onClick={() => setRemote((r) => !r)}
                      className={`group flex w-full items-center justify-between rounded-xl p-3 transition-colors ${
                        remote
                          ? 'bg-teal-50 dark:bg-teal-500/10'
                          : 'hover:bg-slate-50 dark:hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                          remote ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-400 dark:bg-white/10'
                        }`}>
                          <Search className="h-3.5 w-3.5" />
                        </div>
                        <span className={`text-sm font-semibold transition-colors ${
                          remote ? 'text-teal-700 dark:text-teal-400' : 'text-slate-700 dark:text-slate-300'
                        }`}>
                          Remote only
                        </span>
                      </div>
                      <div className={`relative h-5 w-9 rounded-full transition-colors ${
                        remote ? 'bg-teal-500' : 'bg-slate-200 dark:bg-white/20'
                      }`}>
                        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                          remote ? 'translate-x-4' : 'translate-x-0.5'
                        }`} />
                      </div>
                    </button>
                  </div>

                  {/* Posted within */}
                  <div className="border-t border-slate-100 pt-5 dark:border-white/10">
                    <SectionLabel icon={<Clock className="h-3 w-3" />}>
                      Posted Within
                    </SectionLabel>
                    <div className="flex flex-wrap gap-2">
                      {POSTED_OPTIONS.map((o) => (
                        <button
                          key={o.value}
                          type="button"
                          onClick={() => setPostedDays(postedDays === o.value ? undefined : o.value)}
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                            postedDays === o.value
                              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm'
                              : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10'
                          }`}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 p-5 dark:border-white/10">
                  <motion.button
                    onClick={() => refetch()}
                    whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
                    className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-500/25 transition hover:shadow-lg hover:shadow-indigo-500/30"
                  >
                    Apply Filters
                  </motion.button>
                </div>
              </div>
            </aside>

            {/* ── Job list ── */}
            <main className="min-w-0 flex-1">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div key="skeleton" className="space-y-3" exit={{ opacity: 0 }}>
                    {Array.from({ length: 6 }).map((_, i) => <JobCardSkeleton key={i} />)}
                  </motion.div>
                ) : isError ? (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-20 text-center"
                  >
                    <div className="mb-3 rounded-2xl bg-red-50 px-6 py-5 dark:bg-red-900/20">
                      <p className="text-sm font-medium text-red-600 dark:text-red-400">
                        {error instanceof Error ? error.message : 'Failed to load jobs'}
                      </p>
                    </div>
                    <motion.button
                      onClick={() => refetch()}
                      whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
                      className="mt-2 rounded-xl bg-primary/10 px-5 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/20"
                    >
                      Try again
                    </motion.button>
                  </motion.div>
                ) : jobs.length === 0 ? (
                  <motion.div key="empty" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                    <EmptyState
                      icon={<Search className="h-12 w-12 text-slate-300 dark:text-slate-600" />}
                      title="No jobs found"
                      description="Try different filters or keywords."
                      action={{ label: 'Clear filters', onClick: clearFilters }}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="list"
                    className="space-y-3"
                    variants={listVariants}
                    initial="hidden"
                    animate="show"
                  >
                    {jobs.map((job, i) => (
                      <motion.div key={job.id} variants={itemVariants}>
                        <JobCard
                          job={job}
                          index={i}
                          matchScore={useSmartMatch ? rankedJobs[i]?.match.finalScore ?? null : null}
                          onSave={() => saveJob(job.id)}
                          onUnsave={() => unsaveJob(job.id)}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={loaderRef} className="py-6 text-center">
                {isFetchingNextPage && (
                  <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                )}
                {!hasNextPage && jobs.length > 0 && (
                  <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                    You've seen all <span className="font-semibold">{total.toLocaleString()}</span> jobs
                  </p>
                )}
              </div>
            </main>
          </div>
        </PageContainer>
      </div>
    </PageTransition>
  )
}
