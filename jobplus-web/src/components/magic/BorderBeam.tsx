import { motion } from 'framer-motion'

interface BorderBeamProps {
  className?: string
  size?: number
  duration?: number
  colorFrom?: string
  colorTo?: string
}

export function BorderBeam({
  className = '',
  size = 200,
  duration = 8,
  colorFrom = '#4338CA',
  colorTo = '#10B981',
}: BorderBeamProps) {
  // size is used to scale the gradient spread for visual tuning
  const gradientSize = Math.max(30, Math.min(90, size / 4))

  return (
    <motion.div
      className={`pointer-events-none absolute inset-0 rounded-[inherit] ${className}`}
      style={{
        background: `conic-gradient(from 0deg, transparent 0deg, ${colorFrom} ${gradientSize}deg, ${colorTo} ${gradientSize * 2}deg, transparent ${gradientSize * 3}deg)`,
        padding: '1px',
        WebkitMask:
          'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'xor',
        maskComposite: 'exclude',
      }}
      animate={{ rotate: [0, 360] } as Record<string, number[]>}
      transition={{ duration, repeat: Infinity, ease: 'linear' }}
    />
  )
}
