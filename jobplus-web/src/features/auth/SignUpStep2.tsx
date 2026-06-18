import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, useReducedMotion } from 'framer-motion'
import { registerSchema } from '@/schemas/authSchemas'
import type { z } from 'zod'

type Step2Fields = z.infer<typeof registerSchema>

interface SignUpStep2Props {
  role: 'JOB_SEEKER' | 'EMPLOYER'
  onNext: (data: { name: string; email: string; password: string }) => void
  onBack: () => void
}

function getPasswordStrength(password: string): { label: string; width: string; color: string } {
  if (password.length === 0) return { label: '', width: '0%', color: '' }
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 1) return { label: 'Weak', width: '33%', color: 'bg-red-500' }
  if (score <= 2) return { label: 'Medium', width: '66%', color: 'bg-amber-500' }
  return { label: 'Strong', width: '100%', color: 'bg-accent' }
}

export function SignUpStep2({ role, onNext, onBack }: SignUpStep2Props) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Step2Fields>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
    defaultValues: { role },
  })

  const passwordValue = watch('password', '')
  const strength = getPasswordStrength(passwordValue)

  function onSubmit(data: Step2Fields) {
    onNext({ name: data.name, email: data.email, password: data.password })
  }

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, x: 40 }}
      animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
      exit={prefersReducedMotion ? {} : { opacity: 0, x: -40 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="mb-1 text-center text-2xl font-bold text-slate-900 dark:text-white">
        Create your account
      </h2>
      <p className="mb-6 text-center text-sm text-slate-500 dark:text-slate-400">
        Fill in your details to get started
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <input type="hidden" {...register('role')} />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Full name
          </label>
          <input
            type="text"
            autoComplete="name"
            {...register('name')}
            placeholder="Jane Smith"
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500"
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Email
          </label>
          <input
            type="email"
            autoComplete="email"
            {...register('email')}
            placeholder="jane@example.com"
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500"
          />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              {...register('password')}
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 pr-10 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500"
            />
            <motion.button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showPassword ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} />
              </svg>
            </motion.button>
          </div>
          {passwordValue.length > 0 && (
            <div className="mt-2">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                  style={{ width: strength.width }}
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">{strength.label}</p>
            </div>
          )}
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Confirm password
          </label>
          <div className="relative">
            <input
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              {...register('confirmPassword')}
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 pr-10 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500"
            />
            <motion.button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showConfirm ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} />
              </svg>
            </motion.button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <motion.button
            type="button"
            onClick={onBack}
            whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
          >
            Back
          </motion.button>
          <motion.button
            type="submit"
            whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
            className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            Continue
          </motion.button>
        </div>
      </form>
    </motion.div>
  )
}
