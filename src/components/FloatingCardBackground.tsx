import { useMemo } from 'react'

const SUITS = ['♠', '♥', '♦', '♣']

interface SuitItem {
  id: number
  suit: string
  left: string
  size: string
  duration: string
  delay: string
  color: string
}

export default function FloatingCardBackground() {
  const items = useMemo<SuitItem[]>(() => {
    return Array.from({ length: 18 }, (_, i) => ({
      id: i,
      suit: SUITS[i % 4],
      left: `${5 + (i * 17) % 90}%`,
      size: `${18 + (i * 7) % 28}px`,
      duration: `${8 + (i * 3) % 14}s`,
      delay: `${(i * 2.3) % 12}s`,
      color: i % 2 === 0 ? '#C9A84C' : '#C0392B',
    }))
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden>
      {items.map(item => (
        <span
          key={item.id}
          className="floating-suit select-none"
          style={{
            left: item.left,
            fontSize: item.size,
            animationDuration: item.duration,
            animationDelay: item.delay,
            color: item.color,
            opacity: 0,
          }}
        >
          {item.suit}
        </span>
      ))}
    </div>
  )
}
