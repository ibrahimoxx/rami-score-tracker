export const PENALTY_COLORS = [
  { bg: 'rgba(234,88,12,0.8)',   border: 'rgba(234,88,12,0.45)' },   // orange
  { bg: 'rgba(192,57,43,0.85)',  border: 'rgba(185,28,28,0.45)' },   // red
  { bg: 'rgba(147,51,234,0.8)',  border: 'rgba(124,58,237,0.45)' },  // purple
  { bg: 'rgba(37,99,235,0.8)',   border: 'rgba(29,78,216,0.45)' },   // blue
  { bg: 'rgba(5,150,105,0.8)',   border: 'rgba(4,120,87,0.45)' },    // green
]

export const PLAYER_COLORS = [
  { bg: '#C9A84C', text: '#0A0E1A', name: 'Or' },        // Gold
  { bg: '#C0392B', text: '#fff', name: 'Cramoisi' },      // Crimson
  { bg: '#1A5276', text: '#fff', name: 'Saphir' },        // Sapphire
  { bg: '#1E8449', text: '#fff', name: 'Émeraude' },      // Emerald
  { bg: '#6C3483', text: '#fff', name: 'Violet' },        // Violet
  { bg: '#A04000', text: '#fff', name: 'Cuivre' },        // Copper
]

export function getPlayerColor(index: number) {
  return PLAYER_COLORS[index % PLAYER_COLORS.length]
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
