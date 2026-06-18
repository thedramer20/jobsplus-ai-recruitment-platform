import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Particles } from '@/components/magic'
import { BlurFade } from '@/components/magic'
import { OrbitingCircles } from '@/components/magic'
import { BorderBeam } from '@/components/magic'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import { Role } from '@/types'
import { useFirstLogin } from './hooks/useFirstLogin'

export default function WelcomePage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { isFirstTime, markAsSeen } = useFirstLogin()
  const triggerRouteTransition = useUIStore((s) => s.triggerRouteTransition)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  const destination = user?.role === Role.EMPLOYER ? '/employer/dashboard' : '/feed'

  useEffect(() => {
    markAsSeen()
    timerRef.current = setTimeout(
      () => triggerRouteTransition(() => navigate(destination)),
      isFirstTime ? 5000 : 1500
    )
    return () => clearTimeout(timerRef.current)
  }, [navigate, isFirstTime, triggerRouteTransition, destination])

  function handleEnter() {
    clearTimeout(timerRef.current)
    triggerRouteTransition(() => navigate(destination))
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#0a0a1a] via-[#0f0e2e] to-[#0a0a1a]">

      {/* Entry overlay — fades from dark to transparent */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.1 }}
        className="absolute inset-0 z-50 bg-[#0a0a1a] pointer-events-none"
      />

      {/* Skip button */}
      <button
        onClick={handleEnter}
        className="absolute top-6 right-6 z-20 text-xs text-white/40 hover:text-white/80 transition-colors"
      >
        Skip →
      </button>

      {/* Layer 1: Particles background */}
      <Particles
        className="absolute inset-0"
        quantity={80}
        ease={70}
        color="#6366f1"
        refresh={false}
        size={0.6}
      />

      {/* Layer 2: Subtle dot pattern overlay at low opacity */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle,_#6366f1_1px,_transparent_1px)] bg-[length:24px_24px]" />

      {/* Side accent — left */}
      <BlurFade delay={2.0} duration={0.7} className="hidden lg:block absolute left-8 top-1/2 -translate-y-1/2 z-10">
        <p
          className="text-xs tracking-[0.3em] text-indigo-300/40 uppercase rotate-180"
          style={{ writingMode: 'vertical-rl' }}
        >
          Built for your future
        </p>
      </BlurFade>

      {/* Side accent — right */}
      <BlurFade delay={2.2} duration={0.7} className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 z-10">
        <p
          className="text-xs tracking-[0.3em] text-indigo-300/40 uppercase"
          style={{ writingMode: 'vertical-rl' }}
        >
          Beyond the resume
        </p>
      </BlurFade>

      {/* Layer 3: Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">

        {/* Small label above */}
        <BlurFade delay={0.4} duration={0.7}>
          <p className="text-xs font-medium tracking-[0.4em] text-indigo-300/70 mb-8 uppercase">
            Welcome to
          </p>
        </BlurFade>

        {/* Hero text row: JOB + LUS */}
        <div className="flex items-center justify-center gap-2 sm:gap-4">

          <BlurFade delay={0.7} duration={0.7}>
            <span className="text-6xl sm:text-8xl font-serif font-light text-white tracking-tight">
              JOB
            </span>
          </BlurFade>

          {/* The centerpiece — JobPlus brand + */}
          <BlurFade delay={1.0} duration={0.7}>
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center">

              <OrbitingCircles
                className="border-none bg-indigo-500 rounded-full"
                radius={60}
                duration={12}
                iconSize={8}
                path={false}
              >
                <span />
              </OrbitingCircles>

              <OrbitingCircles
                className="border-none bg-emerald-400 rounded-full"
                radius={75}
                duration={18}
                iconSize={6}
                path={false}
                reverse
              >
                <span />
              </OrbitingCircles>

              <OrbitingCircles
                className="border-none bg-indigo-300 rounded-full"
                radius={45}
                duration={9}
                iconSize={4}
                path={false}
              >
                <span />
              </OrbitingCircles>

              {/* The + itself — glowing */}
              <div className="relative z-10 text-6xl sm:text-8xl font-serif text-indigo-400 animate-pulse drop-shadow-[0_0_20px_rgba(99,102,241,0.8)]">
                +
              </div>
            </div>
          </BlurFade>

          <BlurFade delay={1.3} duration={0.7}>
            <span className="text-6xl sm:text-8xl font-serif font-light text-white tracking-tight">
              LUS
            </span>
          </BlurFade>

        </div>

        {/* Subtitle */}
        <BlurFade delay={1.7} duration={0.7}>
          <p className="text-base sm:text-lg text-indigo-100/60 mt-8 font-light italic tracking-wide">
            Find your dream career
          </p>
        </BlurFade>

        {/* Enter CTA */}
        <BlurFade delay={2.4} duration={0.7}>
          <button
            onClick={handleEnter}
            className="relative mt-16 px-8 py-3 rounded-full bg-white/5 backdrop-blur border border-white/20 text-white text-sm font-medium tracking-wide hover:bg-white/10 transition-colors group overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              Enter dashboard
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
            <BorderBeam size={80} duration={6} colorFrom="#10b981" colorTo="#6366f1" />
          </button>
        </BlurFade>

      </div>
    </div>
  )
}
