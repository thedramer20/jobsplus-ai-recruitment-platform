import { motion, useInView } from 'framer-motion'
import { useRef, type ReactNode } from 'react'

interface BlurFadeProps {
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
  inViewOnce?: boolean
}

export function BlurFade({
  children,
  delay = 0,
  duration = 0.4,
  className,
  inViewOnce = true,
}: BlurFadeProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: inViewOnce, margin: '-50px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, filter: 'blur(6px)', y: 8 }}
      animate={inView ? { opacity: 1, filter: 'blur(0px)', y: 0 } : {}}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
