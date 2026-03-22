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
