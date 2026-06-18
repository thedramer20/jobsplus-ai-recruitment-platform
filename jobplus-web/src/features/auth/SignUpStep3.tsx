import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, useReducedMotion } from 'framer-motion'
import { profileBasicsSchema, type ProfileBasicsInput } from '@/schemas/authSchemas'

interface SignUpStep3Props {
  role: 'JOB_SEEKER' | 'EMPLOYER'
  onSubmit: (data: ProfileBasicsInput) => void
  onBack: () => void
  isLoading: boolean
}

export function SignUpStep3({ role, onSubmit, onBack, isLoading }: SignUpStep3Props) {
  const prefersReducedMotion = useReducedMotion()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileBasicsInput>({
    resolver: zodResolver(profileBasicsSchema),
    mode: 'onChange',
  })

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, x: 40 }}
      animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
      exit={prefersReducedMotion ? {} : { opacity: 0, x: -40 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="mb-1 text-center text-2xl font-bold text-slate-900 dark:text-white">
        {role === 'JOB_SEEKER' ? 'Tell us about yourself' : 'Tell us about your company'}
      </h2>
      <p className="mb-6 text-center text-sm text-slate-500 dark:text-slate-400">
        You can update these later
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {role === 'JOB_SEEKER' ? (
          <>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Headline
              </label>
              <input
                type="text"
                {...register('headline')}
                placeholder="e.g. Senior Frontend Developer"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500"
              />
              {errors.headline && (
                <p className="mt-1 text-xs text-red-500">{errors.headline.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Location
              </label>
              <input
                type="text"
                {...register('location')}
                placeholder="e.g. San Francisco, CA"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500"
              />
              {errors.location && (
                <p className="mt-1 text-xs text-red-500">{errors.location.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Bio <span className="text-slate-400">(optional)</span>
              </label>
              <textarea
                {...register('bio')}
                rows={3}
                placeholder="A brief description about yourself…"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500"
              />
              {errors.bio && <p className="mt-1 text-xs text-red-500">{errors.bio.message}</p>}
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Company name
              </label>
              <input
                type="text"
                {...register('headline')}
                placeholder="e.g. Acme Corp"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500"
              />
              {errors.headline && (
                <p className="mt-1 text-xs text-red-500">{errors.headline.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Your position / title
              </label>
              <input
                type="text"
                {...register('bio')}
                placeholder="e.g. Head of Talent"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Location
              </label>
              <input
                type="text"
                {...register('location')}
                placeholder="e.g. New York, NY"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500"
              />
              {errors.location && (
                <p className="mt-1 text-xs text-red-500">{errors.location.message}</p>
              )}
            </div>
          </>
        )}

        <div className="flex gap-3 pt-2">
          <motion.button
            type="button"
            onClick={onBack}
            disabled={isLoading}
            whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
          >
            Back
          </motion.button>
          <motion.button
            type="submit"
            disabled={isLoading}
            whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
            className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating account…
              </span>
            ) : (
              'Create account'
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  )
}
