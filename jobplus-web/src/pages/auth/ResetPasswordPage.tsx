import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useSearchParams } from 'react-router-dom'
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion'
import { Lock, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle2, AlertTriangle } from 'lucide-react'
import { PageTransition } from '@/components/layout/PageTransition'
import { resetPassword } from '@/api/auth'
import { getApiErrorMessage } from '@/api/client'
import { resetPasswordSchema, type ResetPasswordInput } from '@/schemas/authSchemas'
import logoFull from '@/assets/logo/logo-full.svg'

function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <PageTransition>
      <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-6 flex justify-center">
            <img src={logoFull} alt="JobPlus" className="h-9 dark:brightness-0 dark:invert" />
          </div>
          <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-violet-100/40 dark:border-white/10 dark:bg-slate-900 dark:shadow-none">
            <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500" />
            <div className="p-8">{children}</div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

export default function ResetPasswordPage() {
  const reduced = useReducedMotion()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [done, setDone] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange',
  })

  const onSubmit = async (data: ResetPasswordInput) => {
    setServerError(null)
    try {
      await resetPassword({ token, newPassword: data.password })
      setDone(true)
    } catch (err) {
      setServerError(getApiErrorMessage(err))
    }
  }

  // No token in the URL → the link is malformed.
  if (!token) {
    return (
      <CardShell>
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/15">
            <AlertTriangle className="h-7 w-7 text-amber-600 dark:text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Invalid reset link</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            This link is missing or malformed. Request a fresh password reset link to continue.
          </p>
          <Link
            to="/forgot-password"
            className="mt-7 inline-flex items-center gap-1.5 text-sm font-medium text-violet-600 hover:underline dark:text-violet-400"
          >
            Request a new link
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </CardShell>
    )
  }

  if (done) {
    return (
      <CardShell>
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/15">
            <CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Password reset</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Your password has been updated. You can now sign in with your new password.
          </p>
          <Link
            to="/login"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition-all hover:shadow-xl"
          >
            Go to sign in
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </CardShell>
    )
  }

  return (
    <CardShell>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Set a new password</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Choose a strong password you don&rsquo;t use anywhere else.
        </p>
      </div>

      {serverError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
          {serverError}{' '}
          <Link to="/forgot-password" className="font-medium underline">
            Request a new link
          </Link>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* New password */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            New password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              {...register('password')}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-11 text-sm text-slate-900 outline-none transition-all focus:border-violet-500 focus:bg-white focus:ring-3 focus:ring-violet-500/15 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-white/10"
            />
            <button
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-300"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <AnimatePresence>
            {errors.password && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-1.5 text-xs text-red-500"
              >
                {errors.password.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Confirm password */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Confirm password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              {...register('confirmPassword')}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition-all focus:border-violet-500 focus:bg-white focus:ring-3 focus:ring-violet-500/15 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-white/10"
            />
          </div>
          <AnimatePresence>
            {errors.confirmPassword && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-1.5 text-xs text-red-500"
              >
                {errors.confirmPassword.message}
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
          {isSubmitting ? 'Resetting…' : 'Reset password'}
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
    </CardShell>
  )
}
