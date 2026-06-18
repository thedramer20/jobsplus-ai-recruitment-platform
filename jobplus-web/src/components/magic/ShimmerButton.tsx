import { type ButtonHTMLAttributes } from 'react'

interface ShimmerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  background?: string
}

export function ShimmerButton({ children, className = '', background = '#4338CA', ...props }: ShimmerButtonProps) {
  return (
    <button
      {...props}
      className={`group relative overflow-hidden rounded-lg px-6 py-3 font-semibold text-white transition-transform active:scale-95 disabled:opacity-60 ${className}`}
      style={{ background }}
    >
      <span className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-500 group-hover:translate-x-[100%]" />
      <span className="relative z-10">{children}</span>
    </button>
  )
}
