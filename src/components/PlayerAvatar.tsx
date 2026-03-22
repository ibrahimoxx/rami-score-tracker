import { getInitials } from '../utils/colors'

interface Props {
  name: string
  color: string
  textColor: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: { outer: 'w-8 h-8 text-xs', font: '12px' },
  md: { outer: 'w-10 h-10 text-sm', font: '14px' },
  lg: { outer: 'w-12 h-12 text-base', font: '16px' },
}

export default function PlayerAvatar({ name, color, textColor, size = 'md', className = '' }: Props) {
  const s = sizes[size]
  return (
    <div
      className={`${s.outer} rounded-full flex items-center justify-center font-bold flex-shrink-0 ${className}`}
      style={{ background: color, color: textColor, fontSize: s.font }}
    >
      {getInitials(name)}
    </div>
  )
}
