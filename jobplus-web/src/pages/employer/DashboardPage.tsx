import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { PageTransition } from '@/components/layout/PageTransition'
import { Link } from 'react-router-dom'
import {
  Briefcase, Users, CalendarCheck, Award, Plus, ChevronRight,
  TrendingUp, CheckCircle, XCircle, Building2, ArrowUpRight,
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useAuthStore } from '@/store/authStore'
import { getJobs, getJobApplicants } from '@/api/jobs'
import { getMyCompany } from '@/api/companies'
import { useEffect, useState } from 'react'
import type { Application } from '@/types'
import { ApplicationStatus } from '@/types'

const STATUS_COLORS: Record<string, string> = {
  APPLIED:     'bg-blue-100 text-blue-700',
  REVIEWED:    'bg-slate-100 text-slate-600',
  SHORTLISTED: 'bg-cyan-100 text-cyan-700',
  INTERVIEW:   'bg-amber-100 text-amber-700',
  REJECTED:    'bg-red-100 text-red-600',
  OFFER:       'bg-green-100 text-green-700',
}

const STATUS_ICONS: Record<string, React.ElementType> = {
  SHORTLISTED: CheckCircle,
  INTERVIEW:   CalendarCheck,
  OFFER:       Award,
  REJECTED:    XCircle,
}

function buildChartData(apps: Application[]) {
  const counts: Record<string, number> = {}
  apps.forEach((a) => {
    const day = a.appliedAt?.split('T')[0]
    if (day) counts[day] = (counts[day] ?? 0) + 1
  })
  const days = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    days.push({ date: key.slice(5), applications: counts[key] ?? 0 })
  }
  return days
}

interface StatCardProps {
  label: string; value: number; icon: React.ElementType
  gradient: string; iconBg: string; iconColor: string; trend?: string
}

function StatCard({ label, value, icon: Icon, gradient, iconBg, iconColor, trend }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`relative overflow-hidden rounded-2xl p-5 ${gradient} shadow-lg`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-white/80">{label}</p>
          <p className="mt-1 text-3xl font-bold text-white">{value}</p>
          {trend && (
            <p className="mt-1 flex items-center gap-1 text-xs text-white/70">
              <TrendingUp className="h-3 w-3" />{trend}
            </p>
          )}
        </div>
        <div className={`rounded-xl ${iconBg} p-2.5`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </div>
      <div className="pointer-events-none absolute -bottom-4 -right-4 h-20 w-20 rounded-full bg-white/10" />
    </motion.div>
  )
}

const PIPELINE = [
  { status: ApplicationStatus.APPLIED,     label: 'Applied',     color: 'bg-blue-500' },
  { status: ApplicationStatus.REVIEWED,    label: 'Reviewed',    color: 'bg-slate-500' },
  { status: ApplicationStatus.SHORTLISTED, label: 'Shortlisted', color: 'bg-cyan-500' },
  { status: ApplicationStatus.INTERVIEW,   label: 'Interview',   color: 'bg-amber-500' },
  { status: ApplicationStatus.OFFER,       label: 'Offer',       color: 'bg-green-500' },
  { status: ApplicationStatus.REJECTED,    label: 'Rejected',    color: 'bg-red-400' },
]

export default function EmployerDashboardPage() {
  const { user } = useAuthStore()
  const [allApps, setAllApps] = useState<Application[]>([])

  const { data: company } = useQuery({
    queryKey: ['my-company'],
    queryFn: getMyCompany,
  })

  const { data: jobsData, isLoading } = useQuery({
    queryKey: ['employer-jobs', company?.id],
    queryFn: () => getJobs({ size: 100, companyId: company?.id }),
    enabled: company != null,
  })

  const myJobs = jobsData?.content ?? []
  const activeJobs = myJobs.filter((j) => j.status === 'OPEN')

  // Fetch applicants for all jobs
  const appQueries = useQuery({
    queryKey: ['employer-all-apps', myJobs.map((j) => j.id).join(',')],
    queryFn: async () => {
      const results = await Promise.all(
        activeJobs.slice(0, 10).map((j) => getJobApplicants(j.id, 0).catch(() => ({ content: [] as Application[] })))
      )
      return results.flatMap((r) => r.content ?? [])
    },
    enabled: myJobs.length > 0,
  })

  useEffect(() => {
    if (appQueries.data) setAllApps(appQueries.data)
  }, [appQueries.data])

  const totalApps = allApps.length
  const interviews = allApps.filter((a) => a.status === ApplicationStatus.INTERVIEW).length
  const offers     = allApps.filter((a) => a.status === ApplicationStatus.OFFER).length

  const pipelineCounts = PIPELINE.map((p) => ({
    ...p,
    count: allApps.filter((a) => a.status === p.status).length,
  }))

  const recentApps = [...allApps]
    .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
    .slice(0, 5)

  const chartData = buildChartData(allApps)

  const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
  const item    = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50 pb-12 dark:from-slate-950 dark:via-indigo-950/10 dark:to-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-8">

          {/* ── Header ── */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex flex-wrap items-center justify-between gap-3"
          >
            <div>
              <div className="flex items-center gap-3">
                {company?.logoUrl ? (
                  <img src={company.logoUrl} alt={company.name} className="h-10 w-10 rounded-xl object-cover" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-indigo-600 text-lg font-bold text-white shadow-md">
                    {(company?.name ?? user?.name ?? 'E')[0]}
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {company ? company.name : 'Employer Dashboard'}
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Welcome back, {user?.name?.split(' ')[0]} 👋
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!company && (
                <Link
                  to="/employer/company"
                  className="flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/20"
                >
                  <Building2 className="h-4 w-4" />
                  Set up Company
                </Link>
              )}
              <Link
                to="/employer/post-job"
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition hover:shadow-primary/50"
              >
                <Plus className="h-4 w-4" />
                Post a Job
              </Link>
            </div>
          </motion.div>

          {/* ── Stat Cards ── */}
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-2xl bg-white/60 p-5 dark:bg-white/5 h-28" />
              ))}
            </div>
          ) : (
            <motion.div
              variants={stagger} initial="hidden" animate="show"
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              <motion.div variants={item}>
                <StatCard label="Active Jobs" value={activeJobs.length}
                  icon={Briefcase}
                  gradient="bg-gradient-to-br from-primary to-indigo-700"
                  iconBg="bg-white/20" iconColor="text-white"
                  trend="Jobs currently open" />
              </motion.div>
              <motion.div variants={item}>
                <StatCard label="Total Applicants" value={totalApps}
                  icon={Users}
                  gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
                  iconBg="bg-white/20" iconColor="text-white"
                  trend="Across all jobs" />
              </motion.div>
              <motion.div variants={item}>
                <StatCard label="In Interview" value={interviews}
                  icon={CalendarCheck}
                  gradient="bg-gradient-to-br from-amber-500 to-orange-600"
                  iconBg="bg-white/20" iconColor="text-white"
                  trend="Scheduled interviews" />
              </motion.div>
              <motion.div variants={item}>
                <StatCard label="Offers Made" value={offers}
                  icon={Award}
                  gradient="bg-gradient-to-br from-purple-500 to-pink-600"
                  iconBg="bg-white/20" iconColor="text-white"
                  trend="Pending acceptance" />
              </motion.div>
            </motion.div>
          )}

          <div className="mt-6 grid gap-6 lg:grid-cols-3">

            {/* ── Chart + Pipeline ── */}
            <div className="space-y-6 lg:col-span-2">

              {/* Applications chart */}
              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-semibold text-slate-900 dark:text-white">Applications — Last 30 Days</h2>
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    {totalApps} total
                  </span>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="appGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4338CA" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#4338CA" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} interval={4} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                    <Area type="monotone" dataKey="applications" stroke="#4338CA" strokeWidth={2}
                      fill="url(#appGrad)" dot={false} activeDot={{ r: 5, fill: '#4338CA' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Application pipeline */}
              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5"
              >
                <h2 className="mb-4 font-semibold text-slate-900 dark:text-white">Hiring Pipeline</h2>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                  {pipelineCounts.map((p, i) => (
                    <motion.div
                      key={p.status}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + i * 0.06 }}
                      className="flex flex-col items-center gap-1.5"
                    >
                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${p.color} text-xl font-bold text-white shadow-md`}>
                        {p.count}
                      </div>
                      <span className="text-center text-[10px] font-medium text-slate-500 dark:text-slate-400">{p.label}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* ── Right column ── */}
            <div className="space-y-6">

              {/* Recent applicants */}
              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="font-semibold text-slate-900 dark:text-white">Recent Applicants</h2>
                </div>
                <div className="space-y-2.5">
                  {recentApps.length === 0 ? (
                    <p className="py-6 text-center text-sm text-slate-400">No applications yet.</p>
                  ) : recentApps.map((app, i) => {
                    const StatusIcon = STATUS_ICONS[app.status]
                    return (
                      <motion.div
                        key={app.id}
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.45 + i * 0.06 }}
                        className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-slate-50 dark:hover:bg-white/5"
                      >
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/80 to-indigo-500 text-sm font-bold text-white">
                          {(app.seeker?.name ?? '?')[0]}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                            {app.seeker?.name ?? 'Unknown'}
                          </p>
                          <p className="truncate text-xs text-slate-400">{app.job?.title ?? `Job #${app.jobId}`}</p>
                        </div>
                        <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_COLORS[app.status] ?? ''}`}>
                          {StatusIcon ? <StatusIcon className="h-3 w-3" /> : app.status}
                        </span>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>

              {/* My Jobs quick list */}
              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="font-semibold text-slate-900 dark:text-white">My Jobs</h2>
                  <Link to="/employer/jobs" className="flex items-center gap-1 text-xs text-primary hover:underline">
                    View all <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
                <div className="space-y-2">
                  {myJobs.slice(0, 4).map((job) => (
                    <Link
                      key={job.id}
                      to={`/employer/jobs/${job.id}/applicants`}
                      className="group flex items-center justify-between rounded-xl px-3 py-2.5 transition hover:bg-slate-50 dark:hover:bg-white/5"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900 group-hover:text-primary dark:text-white dark:group-hover:text-indigo-400">
                          {job.title}
                        </p>
                        <p className="text-xs text-slate-400">{job.employmentType.replace('_', ' ')}</p>
                      </div>
                      <div className="ml-2 flex items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          job.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                        }`}>{job.status}</span>
                        <ArrowUpRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-primary" />
                      </div>
                    </Link>
                  ))}
                  {myJobs.length === 0 && (
                    <div className="py-4 text-center">
                      <p className="text-sm text-slate-400">No jobs yet.</p>
                      <Link to="/employer/post-job" className="mt-2 inline-block text-xs font-semibold text-primary hover:underline">
                        Post your first job →
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
