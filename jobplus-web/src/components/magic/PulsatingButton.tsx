import { motion } from 'framer-motion'

interface PulsatingButtonProps {
  onClick?: () => void
  onPointerDown?: React.PointerEventHandler<HTMLButtonElement>
  onPointerMove?: React.PointerEventHandler<HTMLButtonElement>
  onPointerUp?: React.PointerEventHandler<HTMLButtonElement>
  onPointerCancel?: React.PointerEventHandler<HTMLButtonElement>
  className?: string
  buttonClassName?: string
  children?: React.ReactNode
  pulseColor?: string
  ariaLabel?: string
}

export function PulsatingButton({
  onClick,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  className = '',
  buttonClassName = '',
  children,
  pulseColor = '#4338CA',
  ariaLabel,
}: PulsatingButtonProps) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: `${pulseColor}33` }}
          animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.5,
            ease: 'easeOut',
          }}
        />
      ))}
      <button
        onClick={onClick}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        aria-label={ariaLabel}
        className={`relative z-10 inline-flex items-center justify-center rounded-full ${buttonClassName}`}
      >
        {children}
      </button>
    </div>
  )
}
