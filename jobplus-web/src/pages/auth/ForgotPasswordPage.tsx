import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion'
import { Mail, ArrowRight, ArrowLeft, MailCheck, KeyRound } from 'lucide-react'
import { PageTransition } from '@/components/layout/PageTransition'
import { requestPasswordReset } from '@/api/auth'
import { getApiErrorMessage } from '@/api/client'
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/schemas/authSchemas'
import logoFull from '@/assets/logo/logo-full.svg'

export default function ForgotPasswordPage() {
  const reduced = useReducedMotion()
  const [sent, setSent] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onChange',
  })

  const onSubmit = async (data: ForgotPasswordInput) => {
    setServerError(null)
    try {
      const url = await requestPasswordReset({ email: data.email })
      setDevResetUrl(url)
      setSubmittedEmail(data.email)
      setSent(true)
    } catch (err) {
      setServerError(getApiErrorMessage(err))
    }
  }

  return (
    <PageTransition>
      <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-6 flex justify-center">
            <img src={logoFull} alt="JobPlus" className="h-9 dark:brightness-0 dark:invert" />
          </div>

          {/* Card */}
          <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-violet-100/40 dark:border-white/10 dark:bg-slate-900 dark:shadow-none">
            <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500" />

            <div className="p-8">
              <AnimatePresence mode="wait">
                {sent ? (
                  <motion.div
                    key="sent"
                    initial={reduced ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                  >
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/15">
                      <MailCheck className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Check your inbox</h1>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                      If an account exists for <strong className="text-slate-700 dark:text-slate-200">{submittedEmail}</strong>,
                      we&rsquo;ve sent a link to reset your password. The link expires in 30 minutes.
                    </p>

                    {/* Dev only: email is disabled locally, so the backend returns the link directly. */}
                    {devResetUrl && (
                      <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-left dark:border-amber-500/20 dark:bg-amber-500/10">
                        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                          <KeyRound className="h-3.5 w-3.5" />
                          Dev mode — email is off
                        </p>
                        <p className="mt-1 text-xs text-amber-700/80 dark:text-amber-300/80">
                          No email was sent. Use this link to reset your password directly.
                        </p>
                        <a
                          href={devResetUrl}
                          className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-amber-700"
                        >
                          Open reset link
                          <ArrowRight className="h-4 w-4" />
                        </a>
                      </div>
                    )}

                    <Link
                      to="/login"
                      className="mt-7 inline-flex items-center gap-1.5 text-sm font-medium text-violet-600 hover:underline dark:text-violet-400"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to sign in
                    </Link>
                  </motion.div>
                ) : (
                  <motion.div
                    key="form"
                    initial={reduced ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduced ? undefined : { opacity: 0, y: -8 }}
                  >
                    <div className="mb-7">
                      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Forgot password?</h1>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Enter your email and we&rsquo;ll send you a link to reset it.
                      </p>
                    </div>

                    {serverError && (
                      <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                        {serverError}
                      </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                          Email address
                        </label>
                        <div className="relative">
                          <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <input
                            type="email"
                            autoComplete="email"
                            {...register('email')}
                            placeholder="you@example.com"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition-all focus:border-violet-500 focus:bg-white focus:ring-3 focus:ring-violet-500/15 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-white/10"
                          />
                        </div>
                        <AnimatePresence>
                          {errors.email && (
                            <motion.p
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-1.5 text-xs text-red-500"
                            >
                              {errors.email.message}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>

                      <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        whileHover={reduced ? {} : { scale: 1.01 }}
                        whileTap={reduced ? {} : { scale: 0.97 }}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition-all hover:shadow-xl hover:shadow-violet-500/40 disabled:opacity-60"
                      >
                        {isSubmitting ? 'Sending…' : 'Send reset link'}
                        {!isSubmitting && <ArrowRight className="h-4 w-4" />}
                      </motion.button>
                    </form>

                    <div className="mt-6 text-center">
                      <Link
                        to="/login"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Back to sign in
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
