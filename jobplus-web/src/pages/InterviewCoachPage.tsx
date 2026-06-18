import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router-dom'
import { Brain, CheckCircle2, ChevronRight, Mic, Sparkles, Target } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { PageTransition } from '@/components/layout/PageTransition'
import { createInterviewSession, getInterviewFeedback, type InterviewQuestion } from '@/api/ai'
import { getApiErrorMessage } from '@/api/client'
import { getJobById } from '@/api/jobs'

export default function InterviewCoachPage() {
  const [searchParams] = useSearchParams()
  const queryJobId = Number(searchParams.get('jobId') ?? '')
  const prefersReducedMotion = useReducedMotion()

  const [roleTitle, setRoleTitle] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [interviewFocus, setInterviewFocus] = useState('behavioral and role-fit')
  const [selectedQuestion, setSelectedQuestion] = useState<InterviewQuestion | null>(null)
  const [answer, setAnswer] = useState('')

  const { data: linkedJob } = useQuery({
    queryKey: ['interview-coach-job', queryJobId],
    queryFn: () => getJobById(queryJobId),
    enabled: Number.isFinite(queryJobId) && queryJobId > 0,
  })

  useEffect(() => {
    if (!linkedJob) return
    setRoleTitle(linkedJob.title)
    setCompanyName(linkedJob.company?.name ?? '')
  }, [linkedJob])

  const sessionMutation = useMutation({
    mutationFn: () => createInterviewSession({
      jobId: Number.isFinite(queryJobId) && queryJobId > 0 ? queryJobId : undefined,
      roleTitle: roleTitle.trim() || undefined,
      companyName: companyName.trim() || undefined,
      interviewFocus: interviewFocus.trim() || undefined,
    }),
    onSuccess: (session) => {
      setSelectedQuestion(session.questions[0] ?? null)
      setAnswer('')
    },
  })

  const feedbackMutation = useMutation({
    mutationFn: () => getInterviewFeedback({
      jobId: Number.isFinite(queryJobId) && queryJobId > 0 ? queryJobId : undefined,
      roleTitle: roleTitle.trim() || undefined,
      question: selectedQuestion?.question ?? '',
      answer,
    }),
  })

  const session = sessionMutation.data
  const feedback = feedbackMutation.data

  const canGenerate = useMemo(
    () => (Number.isFinite(queryJobId) && queryJobId > 0) || roleTitle.trim().length > 0,
    [queryJobId, roleTitle],
  )

  return (
    <PageTransition>
      <div className="page-bg min-h-screen pb-12">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-6 text-white md:p-8"
          >
            <div className="pointer-events-none absolute -right-12 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 left-1/4 h-24 w-24 rounded-full bg-pink-300/20 blur-2xl" />
            <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em]">
                  <Brain className="h-3.5 w-3.5" />
                  AI Interview Coach
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">Practice smarter before the real interview</h1>
                <p className="mt-3 text-sm leading-relaxed text-indigo-100 md:text-base">
                  Generate targeted mock questions, rehearse your answers, and get instant AI feedback tied to your target role.
                </p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-100">Best use</p>
                <p className="mt-2 text-sm leading-relaxed text-white/90">
                  Open this from a job page to get role-specific coaching, or enter your own target role below.
                </p>
              </div>
            </div>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-800">
                <div className="mb-5 flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300">
                    <Target className="h-4 w-4" />
                  </span>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Set your target interview</h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Role title</label>
                    <input
                      value={roleTitle}
                      onChange={(e) => setRoleTitle(e.target.value)}
                      placeholder="Senior Frontend Engineer"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Company name</label>
                    <input
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="TechVentures"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Interview focus</label>
                  <input
                    value={interviewFocus}
                    onChange={(e) => setInterviewFocus(e.target.value)}
                    placeholder="behavioral, technical, stakeholder communication"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  />
                </div>

                {linkedJob && (
                  <div className="mt-4 rounded-2xl border border-indigo-200 bg-indigo-50/70 p-4 text-sm text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300">
                    Using job context from <strong>{linkedJob.title}</strong>{linkedJob.company?.name ? ` at ${linkedJob.company.name}` : ''}.
                  </div>
                )}

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => sessionMutation.mutate()}
                    disabled={sessionMutation.isPending || !canGenerate}
                    className="rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:shadow-xl hover:shadow-indigo-500/35 disabled:opacity-60"
                  >
                    {sessionMutation.isPending ? 'Building coach…' : 'Generate coaching plan'}
                  </button>
                  {Number.isFinite(queryJobId) && queryJobId > 0 && (
                    <Link
                      to={`/jobs/${queryJobId}`}
                      className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
                    >
                      Back to job
                    </Link>
                  )}
                </div>

                {sessionMutation.isError && (
                  <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
                    {getApiErrorMessage(sessionMutation.error) || 'Could not create your interview session.'}
                  </div>
                )}
              </div>

              {session && (
                <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-800">
                  <div className="mb-5">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{session.title}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{session.intro}</p>
                  </div>

                  <div className="space-y-3">
                    {session.questions.map((question, index) => {
                      const active = selectedQuestion?.question === question.question
                      return (
                        <button
                          key={question.question}
                          type="button"
                          onClick={() => {
                            setSelectedQuestion(question)
                            setAnswer('')
                            feedbackMutation.reset()
                          }}
                          className={`w-full rounded-2xl border p-4 text-left transition ${
                            active
                              ? 'border-violet-300 bg-violet-50/70 dark:border-violet-500/30 dark:bg-violet-500/10'
                              : 'border-slate-200 bg-white hover:border-slate-300 dark:border-white/10 dark:bg-white/5'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                              active ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300'
                            }`}>
                              {index + 1}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-slate-900 dark:text-white">{question.question}</p>
                              <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{question.whyItMatters}</p>
                            </div>
                            <ChevronRight className={`h-4 w-4 flex-shrink-0 ${active ? 'text-violet-500' : 'text-slate-300 dark:text-slate-600'}`} />
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-800">
                <div className="mb-5 flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                    <Mic className="h-4 w-4" />
                  </span>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Practice answer</h2>
                </div>

                {selectedQuestion ? (
                  <>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/5">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{selectedQuestion.question}</p>
                      <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{selectedQuestion.answerTip}</p>
                    </div>

                    <textarea
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="Write or paste your practice answer here…"
                      className="mt-4 min-h-[220px] w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm leading-relaxed outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    />

                    <button
                      type="button"
                      onClick={() => feedbackMutation.mutate()}
                      disabled={feedbackMutation.isPending || !answer.trim()}
                      className="mt-4 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:shadow-xl hover:shadow-indigo-500/35 disabled:opacity-60"
                    >
                      {feedbackMutation.isPending ? 'Reviewing answer…' : 'Get AI feedback'}
                    </button>

                    {feedbackMutation.isError && (
                      <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
                        {getApiErrorMessage(feedbackMutation.error) || 'Could not evaluate this answer right now.'}
                      </div>
                    )}

                    {feedback && (
                      <div className="mt-5 space-y-4">
                        <div className="rounded-2xl bg-gradient-to-br from-violet-50 via-white to-indigo-50 p-4 dark:from-violet-500/10 dark:via-slate-800 dark:to-indigo-500/10">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-500">Answer score</p>
                              <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{feedback.summary}</p>
                            </div>
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-xl font-bold text-white shadow-lg">
                              {feedback.score}
                            </div>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                            <CheckCircle2 className="h-4 w-4" />
                            What worked
                          </div>
                          <div className="space-y-2">
                            {feedback.strengths.map((item) => (
                              <p key={item} className="text-sm leading-relaxed text-emerald-900/80 dark:text-emerald-100/90">{item}</p>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-500/20 dark:bg-amber-500/10">
                          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-700 dark:text-amber-300">
                            <Sparkles className="h-4 w-4" />
                            Improve next draft
                          </div>
                          <div className="space-y-2">
                            {feedback.improvements.map((item) => (
                              <p key={item} className="text-sm leading-relaxed text-amber-900/80 dark:text-amber-100/90">{item}</p>
                            ))}
                          </div>
                          <div className="mt-3 rounded-xl border border-amber-200/80 bg-white/70 p-3 text-sm text-amber-900 dark:border-amber-500/20 dark:bg-slate-900/30 dark:text-amber-100">
                            {feedback.improvedAnswerTip}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-8 text-center dark:border-white/10 dark:bg-white/5">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Generate a coaching plan first, then choose a question to practice.
                    </p>
                  </div>
                )}
              </div>

              {session && (
                <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-800">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Preparation tips</h3>
                  <div className="mt-4 space-y-3">
                    {session.preparationTips.map((tip) => (
                      <div key={tip} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-sm leading-relaxed text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                        {tip}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
