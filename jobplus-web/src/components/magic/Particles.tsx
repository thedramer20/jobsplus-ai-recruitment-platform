import React, {
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
} from 'react'

interface MousePosition {
  x: number
  y: number
}

function useMousePosition(): MousePosition {
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 })
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => setMousePosition({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])
  return mousePosition
}

interface ParticlesProps extends ComponentPropsWithoutRef<'div'> {
  className?: string
  quantity?: number
  staticity?: number
  ease?: number
  size?: number
  refresh?: boolean
  color?: string
  vx?: number
  vy?: number
}

type Circle = {
  x: number; y: number; translateX: number; translateY: number
  size: number; alpha: number; targetAlpha: number; dx: number; dy: number; magnetism: number
}

function hexToRgb(hex: string): number[] {
  hex = hex.replace('#', '')
  if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('')
  const int = parseInt(hex, 16)
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255]
}

export const Particles: React.FC<ParticlesProps> = ({
  className = '',
  quantity = 100,
  staticity = 50,
  ease = 50,
  size = 0.4,
  refresh = false,
  color = '#ffffff',
  vx = 0,
  vy = 0,
  ...props
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const ctx = useRef<CanvasRenderingContext2D | null>(null)
  const circles = useRef<Circle[]>([])
  const mousePosition = useMousePosition()
  const mouse = useRef({ x: 0, y: 0 })
  const canvasSize = useRef({ w: 0, h: 0 })
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio : 1
  const rafID = useRef<number | null>(null)
  const resizeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const rgb = hexToRgb(color)

  function circleParams(): Circle {
    return {
      x: Math.floor(Math.random() * canvasSize.current.w),
      y: Math.floor(Math.random() * canvasSize.current.h),
      translateX: 0, translateY: 0,
      size: Math.floor(Math.random() * 2) + size,
      alpha: 0,
      targetAlpha: parseFloat((Math.random() * 0.6 + 0.1).toFixed(1)),
      dx: (Math.random() - 0.5) * 0.1,
      dy: (Math.random() - 0.5) * 0.1,
      magnetism: 0.1 + Math.random() * 4,
    }
  }

  function drawCircle(circle: Circle, update = false) {
    if (!ctx.current) return
    const { x, y, translateX, translateY, size: s, alpha } = circle
    ctx.current.translate(translateX, translateY)
    ctx.current.beginPath()
    ctx.current.arc(x, y, s, 0, 2 * Math.PI)
    ctx.current.fillStyle = `rgba(${rgb.join(', ')}, ${alpha})`
    ctx.current.fill()
    ctx.current.setTransform(dpr, 0, 0, dpr, 0, 0)
    if (!update) circles.current.push(circle)
  }

  function clearContext() {
    ctx.current?.clearRect(0, 0, canvasSize.current.w, canvasSize.current.h)
  }

  function resizeCanvas() {
    if (!containerRef.current || !canvasRef.current || !ctx.current) return
    canvasSize.current.w = containerRef.current.offsetWidth
    canvasSize.current.h = containerRef.current.offsetHeight
    canvasRef.current.width = canvasSize.current.w * dpr
    canvasRef.current.height = canvasSize.current.h * dpr
    canvasRef.current.style.width = `${canvasSize.current.w}px`
    canvasRef.current.style.height = `${canvasSize.current.h}px`
    ctx.current.scale(dpr, dpr)
    circles.current = []
    for (let i = 0; i < quantity; i++) drawCircle(circleParams())
  }

  function remapValue(value: number, s1: number, e1: number, s2: number, e2: number) {
    const r = ((value - s1) * (e2 - s2)) / (e1 - s1) + s2
    return r > 0 ? r : 0
  }

  function animate() {
    clearContext()
    circles.current.forEach((circle, i) => {
      const edge = [
        circle.x + circle.translateX - circle.size,
        canvasSize.current.w - circle.x - circle.translateX - circle.size,
        circle.y + circle.translateY - circle.size,
        canvasSize.current.h - circle.y - circle.translateY - circle.size,
      ]
      const closest = edge.reduce((a, b) => Math.min(a, b))
      const remap = parseFloat(remapValue(closest, 0, 20, 0, 1).toFixed(2))
      if (remap > 1) {
        circle.alpha += 0.02
        if (circle.alpha > circle.targetAlpha) circle.alpha = circle.targetAlpha
      } else {
        circle.alpha = circle.targetAlpha * remap
      }
      circle.x += circle.dx + vx
      circle.y += circle.dy + vy
      circle.translateX += (mouse.current.x / (staticity / circle.magnetism) - circle.translateX) / ease
      circle.translateY += (mouse.current.y / (staticity / circle.magnetism) - circle.translateY) / ease
      drawCircle(circle, true)
      if (
        circle.x < -circle.size || circle.x > canvasSize.current.w + circle.size ||
        circle.y < -circle.size || circle.y > canvasSize.current.h + circle.size
      ) {
        circles.current.splice(i, 1)
        drawCircle(circleParams())
      }
    })
    rafID.current = window.requestAnimationFrame(animate)
  }

  useEffect(() => {
    if (canvasRef.current) ctx.current = canvasRef.current.getContext('2d')
    resizeCanvas()
    animate()
    const handleResize = () => {
      if (resizeTimer.current) clearTimeout(resizeTimer.current)
      resizeTimer.current = setTimeout(resizeCanvas, 200)
    }
    window.addEventListener('resize', handleResize)
    return () => {
      if (rafID.current != null) window.cancelAnimationFrame(rafID.current)
      if (resizeTimer.current) clearTimeout(resizeTimer.current)
      window.removeEventListener('resize', handleResize)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color])

  useEffect(() => {
    if (!canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const { w, h } = canvasSize.current
    const x = mousePosition.x - rect.left - w / 2
    const y = mousePosition.y - rect.top - h / 2
    if (x < w / 2 && x > -w / 2 && y < h / 2 && y > -h / 2) {
      mouse.current.x = x
      mouse.current.y = y
    }
  }, [mousePosition.x, mousePosition.y])

  useEffect(() => { resizeCanvas() }, [refresh])

  return (
    <div
      className={`pointer-events-none ${className}`}
      ref={containerRef}
      aria-hidden="true"
      {...props}
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  )
}
