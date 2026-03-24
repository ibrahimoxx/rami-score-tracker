import type { Round, Player } from '../store/gameStore'

export function calcTotals(players: Player[], rounds: Round[]): Record<string, number> {
  const totals: Record<string, number> = {}
  players.forEach(p => { totals[p.id] = 0 })
  rounds.forEach(round => {
    round.scores.forEach(s => {
      if (totals[s.playerId] === undefined) totals[s.playerId] = 0
      totals[s.playerId] += s.score + s.penalties
    })
  })
  return totals
}


export function sortByScore(players: Player[], totals: Record<string, number>): Player[] {
  return [...players].sort((a, b) => (totals[a.id] ?? 0) - (totals[b.id] ?? 0))
}

export function getWinCounts(players: Player[], rounds: Round[]): Record<string, number> {
  const wins: Record<string, number> = {}
  players.forEach(p => { wins[p.id] = 0 })
  rounds.forEach(round => {
    round.scores.forEach(s => {
      if (s.isWinner) {
        if (wins[s.playerId] === undefined) wins[s.playerId] = 0
        wins[s.playerId]++
      }
    })
  })
  return wins
}

export function getRoundDelta(playerId: string, rounds: Round[], roundIndex: number): number | null {
  if (roundIndex <= 0 || roundIndex >= rounds.length) return null
  const current = rounds[roundIndex].scores.find(s => s.playerId === playerId)
  if (!current) return null
  return current.score + current.penalties
}
