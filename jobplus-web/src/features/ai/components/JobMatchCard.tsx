import { useQuery } from '@tanstack/react-query'
import { Brain, Sparkles, Target } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getSmartMatchForJob } from '@/api/smartMatch'
import { getApiErrorMessage } from '@/api/client'

export function JobMatchCard({ jobId }: { jobId: number }) {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['smart-match', 'job-match', jobId],
    queryFn: () => getSmartMatchForJob(jobId),
    enabled: Number.isFinite(jobId),
    staleTime: 60_000,
  })

  const scoreColor = data && data.finalScore >= 80
    ? 'from-emerald-500 to-teal-500'
    : data && data.finalScore >= 60
      ? 'from-amber-500 to-orange-500'
      : 'from-rose-500 to-pink-500'

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-white/[0.07] dark:bg-slate-800/60">
      <div className="h-1 w-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500" />
      <div className="p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300">
                <Brain className="h-4 w-4" />
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">JobPlus SmartMatch</h3>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Custom weighted ranking across skills, experience, education, location, keywords, and profile completeness.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
          >
            {isFetching ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-20 rounded-2xl bg-slate-100 dark:bg-white/5" />
            <div className="h-4 w-full rounded bg-slate-100 dark:bg-white/5" />
            <div className="h-4 w-4/5 rounded bg-slate-100 dark:bg-white/5" />
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
            {getApiErrorMessage(error) || 'Could not calculate job match right now.'}
          </div>
        ) : data ? (
          <div className="space-y-4">
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-500">Overall Fit</p>
                  <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{data.verdict}</p>
                </div>
                <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${scoreColor} text-xl font-bold text-white shadow-lg`}>
                  {data.finalScore}
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{data.summary}</p>
              <p className="mt-2 text-[11px] text-slate-400 dark:text-slate-500">{data.formula}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
              {[
                ['Skills', data.breakdown.skillMatchScore],
                ['Experience', data.breakdown.experienceMatchScore],
                ['Education', data.breakdown.educationMatchScore],
                ['Location', data.breakdown.locationMatchScore],
                ['Keywords', data.breakdown.keywordRelevanceScore],
                ['Completeness', data.breakdown.profileCompletenessScore],
              ].map(([label, score]) => (
                <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-white/10 dark:bg-white/5">
                  <p className="text-slate-500 dark:text-slate-400">{label}</p>
                  <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{score}/100</p>
                </div>
              ))}
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                <Target className="h-4 w-4 text-emerald-500" />
                Matching strengths
              </div>
              <div className="space-y-2">
                {data.strengths.map((item) => (
                  <p key={item} className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{item}</p>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                <Sparkles className="h-4 w-4 text-amber-500" />
                Gaps to address
              </div>
              <div className="flex flex-wrap gap-2">
                {data.missingSkills.length > 0 ? data.missingSkills.map((gap) => (
                  <span
                    key={gap}
                    className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300"
                  >
                    {gap}
                  </span>
                )) : (
                  <span className="text-sm text-slate-500 dark:text-slate-400">No critical skill gaps detected for this role.</span>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900/40">
              <p className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-200">What to do next</p>
              <div className="space-y-2">
                {data.recommendations.map((item) => (
                  <p key={item} className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{item}</p>
                ))}
              </div>
            </div>

            <Link
              to={`/ai/interview-coach?jobId=${jobId}`}
              className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:shadow-xl hover:shadow-indigo-500/35"
            >
              Practice interview for this job
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  )
}
