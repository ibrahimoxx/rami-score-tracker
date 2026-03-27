import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import * as db from '@/lib/db'

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
  penaltyRules: number[]
}

interface GameState {
  activeGame: ActiveGame | null
  isLoading: boolean
  syncError: string | null
  loadActiveGame: () => Promise<void>
  startGame: (matchName: string, players: Omit<Player, 'id'>[], penaltyRules: number[]) => Promise<void>
  addRound: (scores: RoundScore[]) => Promise<void>
  editLastRound: (scores: RoundScore[]) => Promise<void>
  endGame: () => Promise<ActiveGame | null>
  clearGame: () => void
}

export const useGameStore = create<GameState>((set, get) => ({
  activeGame: null,
  isLoading: false,
  syncError: null,

  loadActiveGame: async () => {
    set({ isLoading: true, syncError: null })
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { set({ isLoading: false }); return }
      const game = await db.getActiveMatch(user.id)
      set({ activeGame: game, isLoading: false })
    } catch (e) {
      set({ isLoading: false, syncError: (e as Error).message })
    }
  },

  startGame: async (matchName, playerDefs, penaltyRules) => {
    set({ isLoading: true, syncError: null })
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')

      const match = await db.createMatch(matchName, user.id, penaltyRules)
      const players = await db.createPlayers(match.id, playerDefs.map((p, i) => ({ ...p, position: i })))

      set({
        isLoading: false,
        activeGame: {
          id: match.id,
          matchName: match.name,
          players,
          rounds: [],
          status: 'active',
          createdAt: match.created_at,
          penaltyRules: (match.penalty_rules as number[]) ?? [],
        },
      })
    } catch (e) {
      set({ isLoading: false, syncError: (e as Error).message })
      throw e
    }
  },

  addRound: async (scores) => {
    const game = get().activeGame
    if (!game) return
    try {
      const roundNumber = game.rounds.length + 1
      const roundRow = await db.createRound(game.id, roundNumber)
      const roundId = roundRow.id as string
      await db.saveRoundScores(roundId, scores)

      const round: Round = {
        id: roundId,
        roundNumber,
        scores,
        createdAt: roundRow.created_at as string,
      }
      set({ activeGame: { ...game, rounds: [...game.rounds, round] } })
    } catch (e) {
      set({ syncError: (e as Error).message })
    }
  },

  editLastRound: async (scores) => {
    const game = get().activeGame
    if (!game || game.rounds.length === 0) return
    try {
      const rounds = [...game.rounds]
      const last = rounds[rounds.length - 1]
      await db.updateRoundScores(last.id, scores)
      rounds[rounds.length - 1] = { ...last, scores }
      set({ activeGame: { ...game, rounds } })
    } catch (e) {
      set({ syncError: (e as Error).message })
    }
  },

  endGame: async () => {
    const game = get().activeGame
    if (!game) return null
    try {
      await db.finishMatch(game.id)
      const finished: ActiveGame = { ...game, status: 'finished' }
      set({ activeGame: null })
      return finished
    } catch (e) {
      set({ syncError: (e as Error).message })
      return null
    }
  },

  clearGame: () => set({ activeGame: null }),
}))
