import { useEffect, useRef } from 'react'
import { useInView, useMotionValue, useSpring } from 'framer-motion'

interface AnimatedCircularProgressBarProps {
  value: number
  size?: number
  strokeWidth?: number
  className?: string
}

export function AnimatedCircularProgressBar({
  value,
  size = 80,
  strokeWidth = 8,
  className = '',
}: AnimatedCircularProgressBarProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  const motionValue = useMotionValue(circumference)
  const springValue = useSpring(motionValue, { damping: 60, stiffness: 100 })

  const numberMotion = useMotionValue(0)
  const numberSpring = useSpring(numberMotion, { damping: 60, stiffness: 100 })

  const circleRef = useRef<SVGCircleElement>(null)
  const textRef = useRef<SVGTextElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const inView = useInView(svgRef, { once: true, margin: '-50px' })

  useEffect(() => {
    if (inView) {
      const targetOffset = circumference - (value / 100) * circumference
      motionValue.set(targetOffset)
      numberMotion.set(value)
    }
  }, [inView, value, circumference, motionValue, numberMotion])

  useEffect(() => {
    return springValue.on('change', (latest) => {
      if (circleRef.current) {
        circleRef.current.setAttribute('stroke-dashoffset', String(latest))
      }
    })
  }, [springValue])

  useEffect(() => {
    return numberSpring.on('change', (latest) => {
      if (textRef.current) {
        textRef.current.textContent = `${Math.round(latest)}%`
      }
    })
  }, [numberSpring])

  const cx = size / 2
  const cy = size / 2

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      aria-label={`${value}% complete`}
    >
      {/* Track circle */}
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        className="stroke-slate-200 dark:stroke-white/10"
      />
      {/* Progress circle — starts at 12 o'clock via rotate(-90deg) */}
      <circle
        ref={circleRef}
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke="#4338CA"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference}
        style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
      />
      {/* Center label */}
      <text
        ref={textRef}
        x={cx}
        y={cy}
        dominantBaseline="middle"
        textAnchor="middle"
        className="fill-slate-700 dark:fill-white"
        style={{ fontSize: size * 0.18, fontWeight: 600 }}
      >
        0%
      </text>
    </svg>
  )
}
