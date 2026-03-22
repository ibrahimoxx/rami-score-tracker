import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ActiveGame } from './gameStore'

export interface SavedMatch extends ActiveGame {
  finishedAt?: string
}

interface HistoryState {
  matches: SavedMatch[]
  saveMatch: (match: SavedMatch) => void
  deleteMatch: (id: string) => void
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      matches: [],
      saveMatch: (match) =>
        set((s) => ({
          matches: [
            { ...match, finishedAt: match.finishedAt ?? new Date().toISOString() },
            ...s.matches.filter(m => m.id !== match.id),
          ],
        })),
      deleteMatch: (id) =>
        set((s) => ({ matches: s.matches.filter(m => m.id !== id) })),
    }),
    { name: 'rami-history' }
  )
)
