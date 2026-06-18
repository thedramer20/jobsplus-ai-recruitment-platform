import { type ReactNode } from 'react'

interface AnimatedShinyTextProps {
  children: ReactNode
  className?: string
}

export function AnimatedShinyText({ children, className = '' }: AnimatedShinyTextProps) {
  return (
    <span
      className={`inline-block animate-shimmer bg-[linear-gradient(110deg,#94a3b8,45%,#f1f5f9,55%,#94a3b8)] bg-[length:200%_100%] bg-clip-text text-transparent dark:bg-[linear-gradient(110deg,#6366f1,45%,#e2e8f0,55%,#6366f1)] ${className}`}
    >
      {children}
    </span>
  )
}
