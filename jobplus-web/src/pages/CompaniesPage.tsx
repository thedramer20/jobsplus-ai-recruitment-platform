import { useState, useEffect, useRef, useCallback } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { PageTransition } from '@/components/layout/PageTransition'
import { Search, SlidersHorizontal, Building2, X, BadgeCheck } from 'lucide-react'
import { CompanyCard } from '@/features/companies/components/CompanyCard'
import { CompanyCardSkeleton } from '@/features/companies/components/CompanyCardSkeleton'
import { companyKeys } from '@/features/companies/queryKeys'
import { getCompanies } from '@/api/companies'
import type { CompanyFilterParams } from '@/api/companies'
import { PageContainer } from '@/components/layout/PageContainer'
import { EmptyState } from '@/components/ui/EmptyState'

const INDUSTRIES = ['Technology', 'Finance', 'Healthcare', 'Education', 'Retail', 'Manufacturing']
const SIZES = ['STARTUP', 'SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE']
const SIZE_LABELS: Record<string, string> = {
  STARTUP:    'Startup (1–10)',
  SMALL:      'Small (11–50)',
  MEDIUM:     'Medium (51–200)',
  LARGE:      'Large (201–1000)',
  ENTERPRISE: 'Enterprise (1000+)',
}

const INDUSTRY_COLORS: Record<string, string> = {
  Technology:    'bg-blue-50   text-blue-700   border-blue-200   dark:bg-blue-500/10   dark:text-blue-400   dark:border-blue-500/20',
  Finance:       'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
  Healthcare:    'bg-rose-50   text-rose-700   border-rose-200   dark:bg-rose-500/10   dark:text-rose-400   dark:border-rose-500/20',
  Education:     'bg-amber-50  text-amber-700  border-amber-200  dark:bg-amber-500/10  dark:text-amber-400  dark:border-amber-500/20',
  Retail:        'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20',
  Manufacturing: 'bg-slate-100 text-slate-700  border-slate-200  dark:bg-slate-700     dark:text-slate-300  dark:border-slate-600',
}
const INDUSTRY_DEFAULT = 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20'

export default function CompaniesPage() {
  const [nameInput, setNameInput]       = useState('')
  const [name, setName]                 = useState('')
  const [industry, setIndustry]         = useState('')
  const [size, setSize]                 = useState('')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [filtersOpen, setFiltersOpen]   = useState(false)

  const filters: CompanyFilterParams = {
    industry:  industry  || undefined,
    size:      size      || undefined,
    location:  name      || undefined,
    verified:  verifiedOnly || undefined,
    pageSize: 20,
  }

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error, refetch } =
    useInfiniteQuery({
      queryKey: companyKeys.list(filters),
      queryFn: ({ pageParam }) => getCompanies({ ...filters, page: pageParam as number }),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        const next = lastPage.currentPage + 1
        return next < lastPage.totalPages ? next : undefined
      },
    })

  const companies = data?.pages.flatMap((p) => p.content) ?? []
  const total     = data?.pages[0]?.totalElements ?? 0

  const loaderRef   = useRef<HTMLDivElement>(null)
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
    setName(nameInput)
  }

  function clearFilters() {
    setIndustry('')
    setSize('')
    setVerifiedOnly(false)
  }

  const hasActiveFilters = !!(industry || size || verifiedOnly)

  const listVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06 } },
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show:   { opacity: 1, y: 0 },
  }

  return (
    <PageTransition>
      <div className="page-bg min-h-screen pb-12">

        {/* ── Hero header ── */}
        <div className="relative overflow-hidden border-b border-slate-200/60 bg-white dark:border-white/[0.06] dark:bg-slate-900">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/50 dark:from-emerald-950/40 dark:via-slate-900 dark:to-teal-950/20" />
          <div className="relative mx-auto max-w-6xl px-4 py-8">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Explore Companies</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {isLoading ? 'Searching…' : `${total.toLocaleString()} companies hiring now`}
                </p>
              </div>
            </div>

            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Search companies…"
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 dark:border-white/10 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                />
              </div>
              <motion.button
                type="submit"
                whileTap={{ scale: 0.97 }}
                className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:from-emerald-500 hover:to-teal-500 hover:shadow-emerald-500/25 hover:shadow-md"
              >
                Search
              </motion.button>
              <motion.button
                type="button"
                onClick={() => setFiltersOpen((o) => !o)}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-600 shadow-sm transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {hasActiveFilters && <span className="h-2 w-2 rounded-full bg-emerald-500" />}
              </motion.button>
            </form>

            {/* Industry quick-filter pills */}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => setIndustry('')}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 ${
                  industry === ''
                    ? 'border-emerald-500 bg-emerald-500 text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                }`}
              >
                All
              </button>
              {INDUSTRIES.map((ind) => {
                const colorCls = INDUSTRY_COLORS[ind] ?? INDUSTRY_DEFAULT
                const isActive = industry === ind
                return (
                  <button
                    key={ind}
                    onClick={() => setIndustry(industry === ind ? '' : ind)}
                    className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 ${
                      isActive ? colorCls + ' shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                    }`}
                  >
                    {ind}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Active filter chips */}
        <AnimatePresence>
          {(hasActiveFilters) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-b border-slate-200/60 bg-white dark:border-white/10 dark:bg-slate-900/60"
            >
              <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-2.5">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Active:</span>
                {industry && (
                  <button
                    onClick={() => setIndustry('')}
                    className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400"
                  >
                    {industry} <X className="h-3 w-3" />
                  </button>
                )}
                {size && (
                  <button
                    onClick={() => setSize('')}
                    className="flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-700 hover:bg-violet-200 dark:bg-violet-500/10 dark:text-violet-400"
                  >
                    {SIZE_LABELS[size] ?? size} <X className="h-3 w-3" />
                  </button>
                )}
                {verifiedOnly && (
                  <button
                    onClick={() => setVerifiedOnly(false)}
                    className="flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 hover:bg-blue-200 dark:bg-blue-500/10 dark:text-blue-400"
                  >
                    Verified only <X className="h-3 w-3" />
                  </button>
                )}
                <button
                  onClick={clearFilters}
                  className="ml-auto text-xs font-medium text-slate-400 hover:text-red-500 dark:hover:text-red-400"
                >
                  Clear all
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <PageContainer size="lg">
          <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-6">

            {/* ── Sidebar ── */}
            <aside className={`${filtersOpen ? 'block' : 'hidden'} mb-4 w-full lg:mb-0 lg:block`}>
              <div className="sticky top-20 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-white/[0.07] dark:bg-slate-800/60">
                <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-5 py-4 dark:border-white/[0.06] dark:from-slate-800 dark:to-slate-800/50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Filters</h3>
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-500 transition hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20"
                      >
                        <X className="h-3 w-3" /> Clear
                      </button>
                    )}
                  </div>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-white/[0.06]">

                  {/* Company Size */}
                  <div className="px-5 py-4">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Company Size
                    </p>
                    <div className="space-y-1.5">
                      {SIZES.map((s) => (
                        <button
                          key={s}
                          onClick={() => setSize(size === s ? '' : s)}
                          className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition-all ${
                            size === s
                              ? 'bg-indigo-50 font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400'
                              : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-white/[0.04]'
                          }`}
                        >
                          <span className={`h-2 w-2 flex-shrink-0 rounded-full ${size === s ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                          {SIZE_LABELS[s] ?? s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Verified only */}
                  <div className="px-5 py-4">
                    <label className="flex cursor-pointer items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BadgeCheck className="h-4 w-4 text-indigo-500" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Verified only</span>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={verifiedOnly}
                        onClick={() => setVerifiedOnly((v) => !v)}
                        className={`relative h-5 w-9 rounded-full transition-colors duration-200 ${
                          verifiedOnly ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-white/20'
                        }`}
                      >
                        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${verifiedOnly ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </button>
                    </label>
                  </div>

                  <div className="px-5 py-4">
                    <motion.button
                      onClick={() => refetch()}
                      whileTap={{ scale: 0.97 }}
                      className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-2.5 text-sm font-semibold text-white transition hover:from-emerald-500 hover:to-teal-500"
                    >
                      Apply Filters
                    </motion.button>
                  </div>
                </div>
              </div>
            </aside>

            {/* ── Grid ── */}
            <main className="min-w-0 flex-1">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div key="skeleton" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" exit={{ opacity: 0 }}>
                    {Array.from({ length: 6 }).map((_, i) => <CompanyCardSkeleton key={i} />)}
                  </motion.div>
                ) : isError ? (
                  <motion.div key="error" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="mb-3 rounded-xl bg-red-50 px-5 py-4 dark:bg-red-900/20">
                      <p className="text-sm font-medium text-red-600 dark:text-red-400">
                        {error instanceof Error ? error.message : 'Failed to load companies'}
                      </p>
                    </div>
                    <motion.button onClick={() => refetch()} whileTap={{ scale: 0.97 }} className="mt-2 rounded-xl bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary/20">
                      Try again
                    </motion.button>
                  </motion.div>
                ) : companies.length === 0 ? (
                  <motion.div key="empty" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                    <EmptyState
                      icon={<Building2 className="h-12 w-12 text-slate-300 dark:text-slate-600" />}
                      title="No companies found"
                      description="Try adjusting your filters or search term."
                      action={{ label: 'Clear filters', onClick: clearFilters }}
                    />
                  </motion.div>
                ) : (
                  <motion.div key="list" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" variants={listVariants} initial="hidden" animate="show">
                    {companies.map((company) => (
                      <motion.div key={company.id} variants={itemVariants}>
                        <CompanyCard company={company} />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={loaderRef} className="py-4 text-center">
                {isFetchingNextPage && (
                  <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-500" />
                )}
                {!hasNextPage && companies.length > 0 && (
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    All {total.toLocaleString()} companies shown
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
