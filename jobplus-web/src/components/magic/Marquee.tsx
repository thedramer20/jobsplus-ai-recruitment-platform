import { type ReactNode } from 'react'

interface MarqueeProps {
  children: ReactNode
  reverse?: boolean
  pauseOnHover?: boolean
  className?: string
}

export function Marquee({ children, reverse = false, pauseOnHover = false, className = '' }: MarqueeProps) {
  return (
    <div
      className={`group flex overflow-hidden [--duration:30s] ${className}`}
    >
      {[0, 1].map((i) => (
        <div
          key={i}
          className={`flex shrink-0 items-center gap-6 ${
            reverse ? 'animate-marquee-reverse' : 'animate-marquee'
          } ${pauseOnHover ? 'group-hover:[animation-play-state:paused]' : ''}`}
        >
          {children}
        </div>
      ))}
    </div>
  )
}
