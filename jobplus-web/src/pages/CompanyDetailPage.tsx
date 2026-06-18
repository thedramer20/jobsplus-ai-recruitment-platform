import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { PageTransition } from '@/components/layout/PageTransition'
import { BadgeCheck, Building2, MapPin, Globe, Briefcase, Check, Users } from 'lucide-react'
import { JobCard } from '@/features/jobs/components/JobCard'
import { companyKeys } from '@/features/companies/queryKeys'
import { getCompanyById, getCompanyJobs } from '@/api/companies'
import { saveJob, unsaveJob } from '@/api/jobs'
import { useUIStore } from '@/store/uiStore'

type Tab = 'jobs' | 'about'

function Skeleton() {
  return (
    <div className="min-h-screen animate-pulse bg-slate-50 dark:bg-surface-dark">
      <div className="h-32 bg-slate-200 dark:bg-white/10" />
      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="h-7 w-1/3 rounded bg-slate-200 dark:bg-white/10" />
        <div className="mt-2 h-4 w-1/4 rounded bg-slate-200 dark:bg-white/10" />
      </div>
    </div>
  )
}

export default function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const companyId = Number(id)
  const [activeTab, setActiveTab] = useState<Tab>('jobs')
  const [jobsPage, setJobsPage] = useState(0)
  const [followed, setFollowed] = useState(false)
  const addToast = useUIStore((s) => s.addToast)

  const { data: company, isLoading } = useQuery({
    queryKey: companyKeys.detail(companyId),
    queryFn: () => getCompanyById(companyId),
    enabled: !!companyId,
  })

  const { data: jobsData, isLoading: jobsLoading } = useQuery({
    queryKey: companyKeys.jobs(companyId, jobsPage),
    queryFn: () => getCompanyJobs(companyId, jobsPage),
    enabled: !!companyId && activeTab === 'jobs',
  })


  if (isLoading) return <Skeleton />
  if (!company) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400">Company not found.</p>
      </div>
    )
  }

  const jobs = jobsData?.content ?? []

  const listVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07 } },
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <PageTransition>
      <div className="page-bg min-h-screen pb-12">
      {/* Banner */}
      <div className="relative h-44 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 overflow-hidden">
        <div className="banner-dot-pattern pointer-events-none absolute inset-0 opacity-[0.07]" />
        <motion.div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <motion.div className="pointer-events-none absolute -bottom-8 left-1/3 h-48 w-48 rounded-full bg-violet-300/20 blur-2xl" />
      </div>

      <div className="mx-auto max-w-5xl px-4">
        {/* Company header card */}
        <div className="relative mb-6 rounded-b-2xl bg-white pb-5 shadow-sm dark:bg-slate-800">
          {/* Follow button */}
          <div className="absolute right-6 top-4">
            <motion.button
              onClick={() => {
                setFollowed((f) => !f)
                addToast(followed ? 'Unfollowed company' : `Following ${company.name}!`, followed ? 'info' : 'success')
              }}
              whileTap={{ scale: 0.97 }}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition-all ${
                followed
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-indigo-500/25 hover:shadow-md'
                  : 'border border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 dark:border-white/10 dark:bg-slate-700 dark:text-slate-200'
              }`}
            >
              {followed && <Check className="h-3.5 w-3.5" />}
              {followed ? 'Following' : '+ Follow'}
            </motion.button>
          </div>

          {/* Logo overlapping banner bottom edge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative -mt-12 ml-6 z-10 h-20 w-20 overflow-hidden rounded-2xl ring-4 ring-white shadow-xl dark:ring-slate-800"
          >
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-600 text-2xl font-bold text-white">
              {company.name.slice(0, 1).toUpperCase()}
            </div>
          </motion.div>

          {/* Company info */}
          <div className="mt-3 ml-6 pr-32">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{company.name}</h1>
              {company.verified && (
                <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Verified
                </span>
              )}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
              {company.industry && (
                <span className="flex items-center gap-1 rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:border-indigo-900/30 dark:bg-indigo-900/20 dark:text-indigo-400">
                  <Building2 className="h-3 w-3" />
                  {company.industry}
                </span>
              )}
              {company.size && (
                <span className="text-sm text-slate-500 dark:text-slate-400">{company.size}</span>
              )}
              {company.location && (
                <span className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                  <MapPin className="h-3.5 w-3.5" />
                  {company.location}
                </span>
              )}
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm font-medium text-indigo-600 transition hover:underline dark:text-indigo-400"
                >
                  <Globe className="h-3.5 w-3.5" />
                  Website
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-slate-200/60 bg-white p-1 dark:border-white/10 dark:bg-white/5">
          {(['jobs', 'about'] as Tab[]).map((tab) => (
            <motion.button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              whileTap={{ scale: 0.97 }}
              className={`relative flex-shrink-0 rounded-lg px-5 py-2 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10'
              }`}
            >
              {tab === 'jobs' && company.jobCount !== undefined
                ? `Open Jobs (${company.jobCount})`
                : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </motion.button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'jobs' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pb-10"
          >
            {jobsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse rounded-2xl bg-white p-5 dark:bg-white/5">
                    <div className="h-5 w-2/3 rounded bg-slate-200 dark:bg-white/10" />
                    <div className="mt-2 h-3 w-1/3 rounded bg-slate-200 dark:bg-white/10" />
                  </div>
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Briefcase className="mb-3 h-10 w-10 text-slate-300 dark:text-slate-600" />
                <p className="text-slate-500 dark:text-slate-400">No open positions right now.</p>
              </div>
            ) : (
              <>
                <motion.div
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
                        onSave={() => saveJob(job.id)}
                        onUnsave={() => unsaveJob(job.id)}
                      />
                    </motion.div>
                  ))}
                </motion.div>
                {jobsData && jobsData.totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-center gap-2">
                    <motion.button
                      onClick={() => setJobsPage((p) => Math.max(0, p - 1))}
                      disabled={jobsPage === 0}
                      whileTap={{ scale: 0.97 }}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm disabled:opacity-40 dark:border-white/10"
                    >
                      Previous
                    </motion.button>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      Page {jobsPage + 1} / {jobsData.totalPages}
                    </span>
                    <motion.button
                      onClick={() => setJobsPage((p) => p + 1)}
                      disabled={jobsPage + 1 >= jobsData.totalPages}
                      whileTap={{ scale: 0.97 }}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm disabled:opacity-40 dark:border-white/10"
                    >
                      Next
                    </motion.button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}

        {activeTab === 'about' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pb-10"
          >
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-800">
                <div className="mb-4 flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
                    <Building2 className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-base font-semibold text-slate-900 dark:text-white">About {company.name}</h2>
                </div>
                {company.description ? (
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {company.description}
                  </p>
                ) : (
                  <p className="text-sm italic text-slate-400">No description available.</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  { label: 'Industry', value: company.industry, icon: <Building2 className="h-4 w-4" /> },
                  { label: 'Company Size', value: company.size, icon: <Users className="h-4 w-4" /> },
                  { label: 'Location', value: company.location, icon: <MapPin className="h-4 w-4" /> },
                  { label: 'Website', value: company.website, icon: <Globe className="h-4 w-4" /> },
                ].map(({ label, value, icon }) =>
                  value ? (
                    <div key={label} className="flex items-start gap-3 rounded-xl border border-slate-200/60 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-800">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                        {icon}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</p>
                        {label === 'Website' ? (
                          <a href={value} target="_blank" rel="noopener noreferrer"
                            className="mt-0.5 block truncate text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                            {value}
                          </a>
                        ) : (
                          <p className="mt-0.5 text-sm font-medium text-slate-900 dark:text-white">{value}</p>
                        )}
                      </div>
                    </div>
                  ) : null
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
      </div>
    </PageTransition>
  )
}
