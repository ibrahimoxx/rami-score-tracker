import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface RoundScore {
  playerId: string
  score: number
  isWinner: boolean
  penalties: number
}

export interface Round {
  id: string
  roundNumber: number
  scores: RoundScore[]
  createdAt: string
}

export interface Player {
  id: string
  name: string
  color: string
  textColor: string
  position: number
}

export interface ActiveGame {
  id: string
  matchName: string
  players: Player[]
  rounds: Round[]
  status: 'active' | 'finished'
  createdAt: string
}

interface GameState {
  activeGame: ActiveGame | null
  startGame: (matchName: string, players: Omit<Player, 'id'>[]) => void
  addRound: (scores: RoundScore[]) => void
  editLastRound: (scores: RoundScore[]) => void
  endGame: () => ActiveGame | null
  clearGame: () => void
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      activeGame: null,

      startGame: (matchName, playerDefs) => {
        const players: Player[] = playerDefs.map((p, i) => ({
          ...p,
          id: uid(),
          position: i,
        }))
        set({
          activeGame: {
            id: uid(),
            matchName,
            players,
            rounds: [],
            status: 'active',
            createdAt: new Date().toISOString(),
          },
        })
      },

      addRound: (scores) => {
        const game = get().activeGame
        if (!game) return
        const round: Round = {
          id: uid(),
          roundNumber: game.rounds.length + 1,
          scores,
          createdAt: new Date().toISOString(),
        }
        set({ activeGame: { ...game, rounds: [...game.rounds, round] } })
      },

      editLastRound: (scores) => {
        const game = get().activeGame
        if (!game || game.rounds.length === 0) return
        const rounds = [...game.rounds]
        const last = rounds[rounds.length - 1]
        rounds[rounds.length - 1] = { ...last, scores }
        set({ activeGame: { ...game, rounds } })
      },

      endGame: () => {
        const game = get().activeGame
        if (!game) return null
        const finished = { ...game, status: 'finished' as const, finishedAt: new Date().toISOString() }
        set({ activeGame: null })
        return finished
      },

      clearGame: () => set({ activeGame: null }),
    }),
    { name: 'rami-active-game' }
  )
)
