interface DotPatternProps {
  className?: string
  dotSize?: number
  spacing?: number
  dotColor?: string
}

export function DotPattern({
  className = '',
  dotSize = 1.5,
  spacing = 20,
  dotColor = 'currentColor',
}: DotPatternProps) {
  const id = 'dot-pattern-bg'

  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full opacity-30 ${className}`}
    >
      <defs>
        <pattern
          id={id}
          x={0}
          y={0}
          width={spacing}
          height={spacing}
          patternUnits="userSpaceOnUse"
        >
          <circle
            cx={spacing / 2}
            cy={spacing / 2}
            r={dotSize}
            fill={dotColor}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  )
}
