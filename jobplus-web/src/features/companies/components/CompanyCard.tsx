import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { BadgeCheck, MapPin, Briefcase, ArrowUpRight } from 'lucide-react'
import type { Company } from '@/types'

interface CompanyCardProps {
  company: Company
}

const INDUSTRY_COLORS: Record<string, { bg: string; text: string }> = {
  Technology:    { bg: 'bg-blue-50   dark:bg-blue-500/10',   text: 'text-blue-700   dark:text-blue-400'   },
  Finance:       { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400' },
  Healthcare:    { bg: 'bg-rose-50   dark:bg-rose-500/10',   text: 'text-rose-700   dark:text-rose-400'   },
  Education:     { bg: 'bg-amber-50  dark:bg-amber-500/10',  text: 'text-amber-700  dark:text-amber-400'  },
  Marketing:     { bg: 'bg-violet-50 dark:bg-violet-500/10', text: 'text-violet-700 dark:text-violet-400' },
  'E-Commerce':  { bg: 'bg-orange-50 dark:bg-orange-500/10', text: 'text-orange-700 dark:text-orange-400' },
  Manufacturing: { bg: 'bg-slate-100 dark:bg-slate-700',     text: 'text-slate-700  dark:text-slate-300'  },
}

const COMPANY_GRADIENTS = [
  'from-indigo-500 to-violet-600',
  'from-emerald-500 to-teal-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-cyan-500 to-blue-600',
  'from-violet-500 to-purple-600',
  'from-teal-500 to-emerald-600',
  'from-pink-500 to-rose-600',
]

function getGradient(name: string) {
  const idx = name.charCodeAt(0) % COMPANY_GRADIENTS.length
  return COMPANY_GRADIENTS[idx]
}

export function CompanyCard({ company }: CompanyCardProps) {
  const prefersReducedMotion = useReducedMotion()
  const gradient = getGradient(company.name)
  const industryStyle = company.industry
    ? (INDUSTRY_COLORS[company.industry] ?? { bg: 'bg-slate-100 dark:bg-slate-700', text: 'text-slate-600 dark:text-slate-300' })
    : null

  return (
    <motion.div
      whileHover={prefersReducedMotion ? {} : { y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Link to={`/companies/${company.id}`} className="group block h-full">
        <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/10 dark:border-white/[0.07] dark:bg-slate-800/60 dark:hover:border-indigo-500/30">

          {/* Hover gradient overlay */}
          <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/[0.03] to-emerald-500/[0.03] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Top row: logo + arrow */}
          <div className="relative mb-4 flex items-start justify-between">
            {company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt={company.name}
                className="h-14 w-14 rounded-2xl object-cover ring-1 ring-slate-200 dark:ring-white/10"
              />
            ) : (
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-lg font-bold text-white shadow-sm`}>
                {company.name.slice(0, 2).toUpperCase()}
              </div>
            )}

            <motion.div
              animate={prefersReducedMotion ? {} : { opacity: 0, x: -4 }}
              whileHover={{ opacity: 1, x: 0 }}
              className="rounded-xl border border-indigo-100 p-1.5 text-indigo-500 opacity-0 transition-all duration-200 group-hover:opacity-100 dark:border-indigo-500/20"
            >
              <ArrowUpRight className="h-4 w-4" />
            </motion.div>
          </div>

          {/* Company name + verified */}
          <div className="mb-1 flex items-center gap-1.5">
            <h3 className="font-bold text-slate-900 transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
              {company.name}
            </h3>
            {company.verified && (
              <BadgeCheck className="h-4 w-4 flex-shrink-0 text-indigo-500" aria-label="Verified company" />
            )}
          </div>

          {/* Industry badge */}
          {company.industry && industryStyle && (
            <span className={`mb-3 inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${industryStyle.bg} ${industryStyle.text}`}>
              {company.industry}
            </span>
          )}

          {/* Meta info */}
          <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-white/[0.06] dark:text-slate-400">
            {company.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {company.location}
              </span>
            )}
            {company.jobCount !== undefined && (
              <span className={`flex items-center gap-1 font-semibold ${company.jobCount > 0 ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
                <Briefcase className="h-3 w-3" />
                {company.jobCount > 0 ? `${company.jobCount} open ${company.jobCount === 1 ? 'role' : 'roles'}` : 'No openings'}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
