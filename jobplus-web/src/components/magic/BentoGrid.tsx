import { type ReactNode } from 'react'

interface BentoGridProps {
  children: ReactNode
  className?: string
}

interface BentoCardProps {
  icon?: ReactNode
  title: string
  description: string
  className?: string
  colSpan?: 1 | 2
}

export function BentoGrid({ children, className = '' }: BentoGridProps) {
  return (
    <div className={`grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {children}
    </div>
  )
}

export function BentoCard({ icon, title, description, className = '', colSpan = 1 }: BentoCardProps) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 transition-shadow hover:shadow-lg dark:border-white/10 dark:bg-white/5 ${
        colSpan === 2 ? 'md:col-span-2' : ''
      } ${className}`}
    >
      {icon && (
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
      )}
      <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
    </div>
  )
}
