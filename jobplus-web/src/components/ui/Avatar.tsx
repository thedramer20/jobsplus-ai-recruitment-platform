import { useState } from 'react'

const COLORS = ['#4338CA', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

const SIZE_PX: Record<string, number> = { sm: 32, md: 40, lg: 64, xl: 96 }

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

interface AvatarProps {
  src: string | null
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function Avatar({ src, name, size = 'md', className = '' }: AvatarProps) {
  const [failed, setFailed] = useState(false)
  const px = SIZE_PX[size]
  const fontSize = px <= 32 ? 12 : px <= 40 ? 14 : px <= 64 ? 22 : 32
  const bg = COLORS[name.charCodeAt(0) % 6]

  const shared = {
    width: px,
    height: px,
    minWidth: px,
    borderRadius: '50%',
  }

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={name}
        style={shared}
        className={`object-cover ${className}`}
        onError={() => setFailed(true)}
      />
    )
  }

  return (
    <div
      style={{ ...shared, background: bg, fontSize, color: '#fff', fontWeight: 600 }}
      className={`flex items-center justify-center select-none shrink-0 ${className}`}
      aria-label={name}
    >
      {initials(name)}
    </div>
  )
}
