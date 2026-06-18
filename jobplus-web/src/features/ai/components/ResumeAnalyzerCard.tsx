import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Brain, CheckCircle2, Sparkles, TriangleAlert } from 'lucide-react'
import { getResumeAnalysis } from '@/api/ai'
import { getApiErrorMessage } from '@/api/client'

function ScoreRing({ score }: { score: number }) {
  const color = score >= 80 ? 'text-emerald-500' : score >= 60 ? 'text-amber-500' : 'text-rose-500'

  return (
    <div className={`flex h-16 w-16 items-center justify-center rounded-2xl border border-current/20 bg-white/70 text-xl font-bold ${color} dark:bg-white/5`}>
      {score}
    </div>
  )
}

export function ResumeAnalyzerCard() {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['ai', 'resume-analysis'],
    queryFn: getResumeAnalysis,
    staleTime: 60_000,
  })

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm dark:border-white/10 dark:bg-slate-800">
      <div className="h-1 bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500" />
      <div className="p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300">
                <Brain className="h-4 w-4" />
              </span>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">AI Resume Analyzer</h3>
            </div>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Reviews your current profile and resume setup for recruiter readiness.
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
            <div className="h-4 w-5/6 rounded bg-slate-100 dark:bg-white/5" />
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
            {getApiErrorMessage(error) || 'Could not load resume analysis right now.'}
          </div>
        ) : data ? (
          <div className="space-y-5">
            <div className="flex flex-col gap-4 rounded-2xl bg-gradient-to-br from-violet-50 via-white to-indigo-50 p-4 dark:from-violet-500/10 dark:via-slate-800 dark:to-indigo-500/10 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-500">Resume Health</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{data.summary}</p>
                <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">
                  Suggested headline: <span className="text-violet-600 dark:text-violet-300">{data.suggestedHeadline}</span>
                </p>
              </div>
              <ScoreRing score={data.score} />
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/60 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" />
                  Strengths
                </div>
                <div className="space-y-2">
                  {data.strengths.map((item) => (
                    <p key={item} className="text-sm leading-relaxed text-emerald-900/80 dark:text-emerald-100/90">{item}</p>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-amber-200/70 bg-amber-50/70 p-4 dark:border-amber-500/20 dark:bg-amber-500/10">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-700 dark:text-amber-300">
                  <Sparkles className="h-4 w-4" />
                  Improvements
                </div>
                <div className="space-y-2">
                  {data.improvements.map((item) => (
                    <p key={item} className="text-sm leading-relaxed text-amber-900/80 dark:text-amber-100/90">{item}</p>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-rose-200/70 bg-rose-50/70 p-4 dark:border-rose-500/20 dark:bg-rose-500/10">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-rose-700 dark:text-rose-300">
                  <TriangleAlert className="h-4 w-4" />
                  Missing Signals
                </div>
                <div className="space-y-2">
                  {data.missingSignals.length > 0 ? data.missingSignals.map((item) => (
                    <p key={item} className="text-sm leading-relaxed text-rose-900/80 dark:text-rose-100/90">{item}</p>
                  )) : (
                    <p className="text-sm text-rose-900/80 dark:text-rose-100/90">No major missing signals detected.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/5">
              <p className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-200">ATS Tips</p>
              <div className="space-y-2">
                {data.atsTips.map((tip, index) => (
                  <motion.p
                    key={tip}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04, duration: 0.2 }}
                    className="text-sm leading-relaxed text-slate-600 dark:text-slate-300"
                  >
                    {tip}
                  </motion.p>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
