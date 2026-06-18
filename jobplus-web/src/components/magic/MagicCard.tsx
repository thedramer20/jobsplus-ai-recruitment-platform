import { useRef, useState, type ReactNode } from 'react'

interface MagicCardProps {
  children: ReactNode
  className?: string
  gradientColor?: string
}

export function MagicCard({ children, className = '', gradientColor = 'rgba(67,56,202,0.12)' }: MagicCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white dark:border-white/10 dark:bg-slate-800 ${className}`}
      style={{
        background: isHovered
          ? `radial-gradient(400px circle at ${position.x}px ${position.y}px, ${gradientColor}, transparent 60%), ${
              document.documentElement.classList.contains('dark')
                ? 'rgb(30,41,59)'
                : 'white'
            }`
          : undefined,
      }}
    >
      {children}
    </div>
  )
}
