import { motion } from 'framer-motion'
import { useUIStore } from '@/store/uiStore'

export function AppTransitionOverlay() {
  const routeTransition = useUIStore((s) => s.routeTransition)
  const endRouteTransition = useUIStore((s) => s.endRouteTransition)

  if (!routeTransition) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 1, 1, 0],
        scale: [0, 18, 18, 18],
      }}
      transition={{
        duration: 1.9,
        times: [0, 0.42, 0.68, 1],
        ease: 'easeInOut',
      }}
      onAnimationComplete={endRouteTransition}
      className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center"
    >
      <div className="w-28 h-28 rounded-full bg-white shadow-[0_0_180px_90px_rgba(255,255,255,0.95)]" />
    </motion.div>
  )
}
