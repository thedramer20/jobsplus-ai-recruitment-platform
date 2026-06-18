import { motion, useReducedMotion } from 'framer-motion'

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <motion.div
        className="mb-4"
        animate={prefersReducedMotion ? {} : { y: [0, -6, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        {icon}
      </motion.div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
      )}
      {action && (
        <motion.button
          onClick={action.onClick}
          whileTap={{ scale: 0.97 }}
          className="mt-4 rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary/20"
        >
          {action.label}
        </motion.button>
      )}
    </div>
  )
}
