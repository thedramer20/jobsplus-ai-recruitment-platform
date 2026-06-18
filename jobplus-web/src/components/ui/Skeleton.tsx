import { motion, useReducedMotion } from 'framer-motion'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return (
      <div className={`rounded bg-slate-200 dark:bg-slate-700 ${className}`} />
    )
  }

  return (
    <motion.div
      className={`rounded [--sk-base:#e2e8f0] [--sk-shine:#f1f5f9] dark:[--sk-base:#334155] dark:[--sk-shine:#475569] ${className}`}
      style={{
        backgroundImage: 'linear-gradient(90deg, var(--sk-base) 25%, var(--sk-shine) 50%, var(--sk-base) 75%)',
        backgroundSize: '200% 100%',
      }}
      animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
      transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
    />
  )
}
