import type { ReactNode } from 'react'

interface PageContainerProps {
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'full'
  className?: string
}

const SIZE_CLASSES: Record<NonNullable<PageContainerProps['size']>, string> = {
  sm:   'max-w-2xl mx-auto px-4 py-6',
  md:   'max-w-4xl mx-auto px-4 py-6',
  lg:   'max-w-6xl mx-auto px-4 py-6',
  full: 'w-full px-4 py-6',
}

export function PageContainer({ children, size = 'md', className = '' }: PageContainerProps) {
  return (
    <div className={`${SIZE_CLASSES[size]}${className ? ` ${className}` : ''}`}>
      {children}
    </div>
  )
}
