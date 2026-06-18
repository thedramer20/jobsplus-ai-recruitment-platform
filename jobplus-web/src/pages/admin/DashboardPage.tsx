import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, useReducedMotion } from 'framer-motion'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  Users,
  Briefcase,
  FileSpreadsheet,
  Building2,
  UserCheck,
  UserCog,
  Activity,
  Clock,
  XCircle,
  Award,
  Star,
  RefreshCw,
  Target,
  Zap,
} from 'lucide-react'
import { NumberTicker } from '@/components/magic/NumberTicker'
import { DotPattern } from '@/components/magic/DotPattern'
import { getStats } from '@/api/admin'
import type { AdminStats } from '@/api/admin'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageTransition } from '@/components/layout/PageTransition'

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.35, ease: 'easeOut' },
  }),
}

const ROLE_COLORS = ['#4338CA', '#10B981', '#F59E0B']
const ROLE_DOT_CLASSES = ['bg-indigo-600', 'bg-emerald-500', 'bg-amber-500']

const STATUS_CONFIG: Record<string, { label: string; color: string; barColor: string; icon: React.ElementType }> = {
  APPLIED:     { label: 'Applied',     color: '#4338CA', barColor: 'bg-indigo-500',  icon: FileSpreadsheet },
  REVIEWED:    { label: 'Reviewed',    color: '#3B82F6', barColor: 'bg-blue-500',    icon: Activity },
  SHORTLISTED: { label: 'Shortlisted', color: '#8B5CF6', barColor: 'bg-violet-500',  icon: Star },
  INTERVIEW:   { label: 'Interview',   color: '#F59E0B', barColor: 'bg-amber-500',   icon: Clock },
  REJECTED:    { label: 'Rejected',    color: '#EF4444', barColor: 'bg-red-500',     icon: XCircle },
  OFFER:       { label: 'Offer',       color: '#10B981', barColor: 'bg-emerald-500', icon: Award },
}

interface TooltipProps {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}

function SignupTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg dark:border-slate-700 dark:bg-slate-800">
      <p className="text-[10px] text-slate-400 mb-0.5">{label}</p>
      <p className="text-sm font-bold text-slate-900 dark:text-white">{payload[0].value} signups</p>
    </div>
  )
}

interface StatCardProps {
  label: string
  value: number
  icon: React.ElementType
  accentClass: string
  iconBgClass: string
  iconColorClass: string
  badge?: string
  badgeClass?: string
  subtitle?: string
  index: number
  shouldAnimate: boolean
}

function StatCard({ label, value, icon: Icon, accentClass, iconBgClass, iconColorClass, badge, badgeClass, subtitle, index, shouldAnimate }: StatCardProps) {
  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial={shouldAnimate ? 'hidden' : false}
      animate="visible"
      className="relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 dark:border-white/10 dark:bg-slate-900"
    >
      <div className={`absolute inset-x-0 top-0 h-0.5 ${accentClass}`} />
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBgClass}`}>
            <Icon size={18} className={iconColorClass} />
          </div>
          {badge && (
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold leading-5 ${badgeClass}`}>
              {badge}
            </span>
          )}
        </div>
        <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          <NumberTicker value={value} />
        </p>
        <p className="mt-0.5 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </p>
        {subtitle && (
          <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">{subtitle}</p>
        )}
      </div>
    </motion.div>
  )
}

function StatCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900">
      <div className="mb-4 flex items-start justify-between">
        <div className="h-10 w-10 rounded-xl bg-slate-200 dark:bg-slate-700" />
        <div className="h-5 w-16 rounded-full bg-slate-200 dark:bg-slate-700" />
      </div>
      <div className="h-7 w-20 rounded bg-slate-200 dark:bg-slate-700 mb-1" />
      <div className="h-3 w-24 rounded bg-slate-100 dark:bg-slate-800" />
    </div>
  )
}

function ApplicationPipeline({ data }: { data: Array<{ status: string; count: number }> }) {
  const total = data.reduce((s, d) => s + d.count, 0)
  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900 h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Application Pipeline</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{total} total across all stages</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 dark:bg-slate-800">
          <Target size={12} className="text-slate-500" />
          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">All time</span>
        </div>
      </div>
      <div className="space-y-4">
        {data.map((item) => {
          const cfg = STATUS_CONFIG[item.status] ?? {
            label: item.status,
            color: '#94a3b8',
            barColor: 'bg-slate-400',
            icon: Activity,
          }
          const pct = total > 0 ? Math.round((item.count / total) * 100) : 0
          const Icon = cfg.icon
          return (
            <div key={item.status}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Icon size={13} style={{ color: cfg.color }} />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{cfg.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">{pct}%</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 w-6 text-right">{item.count}</span>
                </div>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                <motion.div
                  className={`h-2 rounded-full ${cfg.barColor}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.7, ease: 'easeOut', delay: 0.4 }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface KpiCardProps {
  label: string
  value: string
  desc: string
  icon: React.ElementType
  colorClass: string
}

function KpiCard({ label, value, desc, icon: Icon, colorClass }: KpiCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${colorClass}`}>
        <Icon size={16} className="text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{value}</p>
        <p className="text-xs font-medium text-slate-600 dark:text-slate-400">{label}</p>
        <p className="text-[10px] text-slate-400 truncate">{desc}</p>
      </div>
    </div>
  )
}

type DateRange = 7 | 30 | 90

const DATE_RANGE_OPTIONS: { label: string; value: DateRange }[] = [
  { label: '7d',  value: 7  },
  { label: '30d', value: 30 },
  { label: '90d', value: 90 },
]

function DashboardContent({ stats }: { stats: AdminStats }) {
  const shouldAnimate = !useReducedMotion()
  const [dateRange, setDateRange] = useState<DateRange>(30)

  const chartData = stats.signupsLast30Days.slice(-Math.min(dateRange, stats.signupsLast30Days.length))

  const adminCount = Math.max(0, stats.totalUsers - stats.totalSeekers - stats.totalEmployers)
  const roleData = [
    { name: 'Seekers', value: stats.totalSeekers },
    { name: 'Employers', value: stats.totalEmployers },
    ...(adminCount > 0 ? [{ name: 'Admins', value: adminCount }] : []),
  ]

  const seekerPct = stats.totalUsers > 0 ? Math.round((stats.totalSeekers / stats.totalUsers) * 100) : 0
  const employerPct = stats.totalUsers > 0 ? Math.round((stats.totalEmployers / stats.totalUsers) * 100) : 0
  const avgAppsPerJob = stats.totalJobs > 0 ? (stats.totalApplications / stats.totalJobs).toFixed(1) : '—'
  const openJobPct = stats.totalJobs > 0 ? Math.round((stats.openJobs / stats.totalJobs) * 100) : 0
  const seekerToEmployer = stats.totalEmployers > 0 ? `${(stats.totalSeekers / stats.totalEmployers).toFixed(1)} : 1` : '—'

  const statCards = [
    {
      label: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      accentClass: 'bg-gradient-to-r from-indigo-500 to-indigo-400',
      iconBgClass: 'bg-indigo-50 dark:bg-indigo-500/10',
      iconColorClass: 'text-indigo-600 dark:text-indigo-400',
      badge: `+${stats.newUsersLast30Days} this month`,
      badgeClass: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400',
    },
    {
      label: 'Job Seekers',
      value: stats.totalSeekers,
      icon: UserCheck,
      accentClass: 'bg-gradient-to-r from-blue-500 to-blue-400',
      iconBgClass: 'bg-blue-50 dark:bg-blue-500/10',
      iconColorClass: 'text-blue-600 dark:text-blue-400',
      subtitle: `${seekerPct}% of all users`,
    },
    {
      label: 'Employers',
      value: stats.totalEmployers,
      icon: UserCog,
      accentClass: 'bg-gradient-to-r from-violet-500 to-violet-400',
      iconBgClass: 'bg-violet-50 dark:bg-violet-500/10',
      iconColorClass: 'text-violet-600 dark:text-violet-400',
      subtitle: `${employerPct}% of all users`,
    },
    {
      label: 'Active Jobs',
      value: stats.openJobs,
      icon: Zap,
      accentClass: 'bg-gradient-to-r from-amber-500 to-amber-400',
      iconBgClass: 'bg-amber-50 dark:bg-amber-500/10',
      iconColorClass: 'text-amber-600 dark:text-amber-400',
      subtitle: `of ${stats.totalJobs} total jobs`,
    },
    {
      label: 'Applications',
      value: stats.totalApplications,
      icon: FileSpreadsheet,
      accentClass: 'bg-gradient-to-r from-emerald-500 to-emerald-400',
      iconBgClass: 'bg-emerald-50 dark:bg-emerald-500/10',
      iconColorClass: 'text-emerald-600 dark:text-emerald-400',
      badge: 'All time',
      badgeClass: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    },
    {
      label: 'Companies',
      value: stats.totalCompanies,
      icon: Building2,
      accentClass: 'bg-gradient-to-r from-rose-500 to-rose-400',
      iconBgClass: 'bg-rose-50 dark:bg-rose-500/10',
      iconColorClass: 'text-rose-600 dark:text-rose-400',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {statCards.map((card, i) => (
          <StatCard key={card.label} {...card} index={i} shouldAnimate={shouldAnimate} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Area chart: Signups */}
        <motion.div
          custom={6}
          variants={fadeUp}
          initial={shouldAnimate ? 'hidden' : false}
          animate="visible"
          className="lg:col-span-3 rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">New Signups</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {stats.newUsersLast30Days} new · last {Math.min(dateRange, stats.signupsLast30Days.length)} days
              </p>
            </div>
            <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-white/10 dark:bg-slate-800">
              {DATE_RANGE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDateRange(opt.value)}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all duration-150 ${
                    dateRange === opt.value
                      ? 'bg-white text-indigo-700 shadow-sm dark:bg-slate-700 dark:text-indigo-400'
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="signupGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4338CA" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#4338CA" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <Tooltip content={<SignupTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#4338CA"
                strokeWidth={2}
                fill="url(#signupGrad)"
                dot={false}
                activeDot={{ r: 4, fill: '#4338CA', strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Donut: User role breakdown */}
        <motion.div
          custom={7}
          variants={fadeUp}
          initial={shouldAnimate ? 'hidden' : false}
          animate="visible"
          className="lg:col-span-2 rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900 flex flex-col"
        >
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">User Breakdown</h3>
            <p className="text-xs text-slate-400 mt-0.5">By role type</p>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={roleData}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={72}
                  dataKey="value"
                  strokeWidth={0}
                  paddingAngle={3}
                >
                  {roleData.map((_, i) => (
                    <Cell key={i} fill={ROLE_COLORS[i % ROLE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  formatter={(val, name) => [val, name]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-full mt-3 space-y-2">
              {roleData.map((item, i) => {
                const pct = stats.totalUsers > 0 ? Math.round((item.value / stats.totalUsers) * 100) : 0
                return (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`h-2.5 w-2.5 rounded-full ${ROLE_DOT_CLASSES[i % ROLE_DOT_CLASSES.length]}`} />
                      <span className="text-xs text-slate-600 dark:text-slate-400">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">{pct}%</span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white w-6 text-right">{item.value}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Pipeline + Platform Insights */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <motion.div
          custom={8}
          variants={fadeUp}
          initial={shouldAnimate ? 'hidden' : false}
          animate="visible"
          className="lg:col-span-3"
        >
          <ApplicationPipeline data={stats.applicationsByStatus} />
        </motion.div>

        <motion.div
          custom={9}
          variants={fadeUp}
          initial={shouldAnimate ? 'hidden' : false}
          animate="visible"
          className="lg:col-span-2 rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900"
        >
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Platform Insights</h3>
            <p className="text-xs text-slate-400 mt-0.5">Computed from live data</p>
          </div>
          <div className="space-y-3">
            <KpiCard
              label="Avg Applications per Job"
              value={String(avgAppsPerJob)}
              desc={`across ${stats.totalJobs} total listings`}
              icon={Activity}
              colorClass="bg-indigo-500"
            />
            <KpiCard
              label="Open Job Rate"
              value={`${openJobPct}%`}
              desc={`${stats.openJobs} open of ${stats.totalJobs} total`}
              icon={Briefcase}
              colorClass="bg-amber-500"
            />
            <KpiCard
              label="Seeker : Employer Ratio"
              value={seekerToEmployer}
              desc="seekers per employer account"
              icon={Users}
              colorClass="bg-emerald-500"
            />
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 animate-pulse rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900">
          <div className="mb-6 flex justify-between">
            <div className="space-y-1.5">
              <div className="h-4 w-28 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-3 w-20 rounded bg-slate-100 dark:bg-slate-800" />
            </div>
            <div className="h-7 w-20 rounded-lg bg-slate-200 dark:bg-slate-700" />
          </div>
          <div className="h-52 w-full rounded-xl bg-slate-100 dark:bg-slate-800" />
        </div>
        <div className="lg:col-span-2 animate-pulse rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900">
          <div className="mb-4 space-y-1.5">
            <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-3 w-20 rounded bg-slate-100 dark:bg-slate-800" />
          </div>
          <div className="mx-auto h-40 w-40 rounded-full bg-slate-100 dark:bg-slate-800" />
          <div className="mt-4 space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-4 w-full rounded bg-slate-100 dark:bg-slate-800" />
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 animate-pulse rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900">
          <div className="space-y-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-700" />
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800" />
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-2 animate-pulse rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900">
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 w-full rounded-xl bg-slate-100 dark:bg-slate-800" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: getStats,
  })

  return (
    <PageTransition>
      <div className="relative min-h-full">
        <DotPattern className="text-slate-300/50 dark:text-white/5" />
        <PageContainer size="full" className="relative z-10">
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Platform overview and key metrics
              </p>
            </div>
            <button
              type="button"
              onClick={() => void refetch()}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:shadow-md dark:border-white/10 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <RefreshCw size={13} />
              Refresh
            </button>
          </div>

          {isLoading || !stats ? <DashboardSkeleton /> : <DashboardContent stats={stats} />}
        </PageContainer>
      </div>
    </PageTransition>
  )
}
