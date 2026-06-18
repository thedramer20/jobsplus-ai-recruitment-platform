import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Check } from 'lucide-react'

interface SignUpStep1Props {
  onNext: (role: 'JOB_SEEKER' | 'EMPLOYER') => void
}

export function SignUpStep1({ onNext }: SignUpStep1Props) {
  const [selected, setSelected] = useState<'JOB_SEEKER' | 'EMPLOYER' | null>(null)
  const prefersReducedMotion = useReducedMotion()

  function handleSelect(role: 'JOB_SEEKER' | 'EMPLOYER') {
    setSelected(role)
    setTimeout(() => onNext(role), 300)
  }

  const springTransition = { type: 'spring' as const, stiffness: 280, damping: 20 }

  function cardClass(role: 'JOB_SEEKER' | 'EMPLOYER') {
    const active = selected === role
    return [
      'relative cursor-pointer rounded-2xl border-2 p-6 transition-all duration-200',
      active
        ? 'border-indigo-500 bg-indigo-50 shadow-md ring-2 ring-indigo-200 ring-offset-2 dark:bg-indigo-900/30 dark:ring-indigo-700 dark:ring-offset-slate-900'
        : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/30 hover:shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:hover:border-indigo-600 dark:hover:bg-indigo-900/20',
    ].join(' ')
  }

  function iconClass(role: 'JOB_SEEKER' | 'EMPLOYER') {
    return [
      'mb-4 inline-flex rounded-xl p-3.5 transition-colors duration-200',
      selected === role
        ? 'bg-indigo-100 dark:bg-indigo-800/50'
        : 'bg-slate-100 dark:bg-slate-700',
    ].join(' ')
  }

  function titleClass(role: 'JOB_SEEKER' | 'EMPLOYER') {
    return [
      'mt-1 text-base font-bold',
      selected === role
        ? 'text-indigo-900 dark:text-indigo-300'
        : 'text-slate-800 dark:text-white',
    ].join(' ')
  }

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, x: 40 }}
      animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
      exit={prefersReducedMotion ? {} : { opacity: 0, x: -40 }}
      transition={{ duration: 0.3 }}
    >
      <h1 className="mb-2 text-center text-3xl font-bold text-slate-900 dark:text-white">
        Join JobPlus
      </h1>
      <p className="mb-8 text-center text-slate-500 dark:text-slate-400">
        Tell us who you are to get started
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <motion.div
          onClick={() => handleSelect('JOB_SEEKER')}
          whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
          whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
          animate={prefersReducedMotion ? {} : { scale: selected === 'JOB_SEEKER' ? 1.03 : 1 }}
          transition={springTransition}
          className={cardClass('JOB_SEEKER')}
        >
          {selected === 'JOB_SEEKER' && (
            <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500">
              <Check className="h-3.5 w-3.5 text-white" />
            </div>
          )}
          <div className={iconClass('JOB_SEEKER')}>
            <svg className="h-7 w-7 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className={titleClass('JOB_SEEKER')}>I&apos;m looking for a job</h3>
          <p className="mt-1 text-sm leading-snug text-slate-500 dark:text-slate-400">
            Discover opportunities and advance your career
          </p>
        </motion.div>

        <motion.div
          onClick={() => handleSelect('EMPLOYER')}
          whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
          whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
          animate={prefersReducedMotion ? {} : { scale: selected === 'EMPLOYER' ? 1.03 : 1 }}
          transition={springTransition}
          className={cardClass('EMPLOYER')}
        >
          {selected === 'EMPLOYER' && (
            <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500">
              <Check className="h-3.5 w-3.5 text-white" />
            </div>
          )}
          <div className={iconClass('EMPLOYER')}>
            <svg className="h-7 w-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className={titleClass('EMPLOYER')}>I&apos;m hiring talent</h3>
          <p className="mt-1 text-sm leading-snug text-slate-500 dark:text-slate-400">
            Post jobs and find the best candidates
          </p>
        </motion.div>
      </div>
    </motion.div>
  )
}
