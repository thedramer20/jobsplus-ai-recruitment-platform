import { useState, type ReactNode } from 'react'

interface NeonGradientCardProps {
  children: ReactNode
  className?: string
  neonColors?: { firstColor: string; secondColor: string }
  borderSize?: number
  borderRadius?: number
}

export function NeonGradientCard({
  children,
  className = '',
  neonColors = { firstColor: '#ff00aa', secondColor: '#00FFF1' },
  borderSize = 3,
  borderRadius = 16,
}: NeonGradientCardProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10 transition-all duration-300"
        style={{
          background: `linear-gradient(135deg, ${neonColors.firstColor}, ${neonColors.secondColor})`,
          borderRadius: `${borderRadius + borderSize}px`,
          margin: `-${borderSize}px`,
          opacity: hovered ? 0.9 : 0.5,
          filter: hovered ? 'blur(14px)' : 'blur(7px)',
        }}
      />
      <div
        className="relative overflow-hidden bg-white dark:bg-slate-900"
        style={{ borderRadius: `${borderRadius}px` }}
      >
        {children}
      </div>
    </div>
  )
}
