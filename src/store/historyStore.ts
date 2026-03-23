import { create } from 'zustand'
import type { ActiveGame } from './gameStore'
import * as db from '@/lib/db'

export interface SavedMatch extends ActiveGame {
  finishedAt?: string
}

interface HistoryState {
  matches: SavedMatch[]
  isLoading: boolean
  loadMatches: () => Promise<void>
  deleteMatch: (id: string) => Promise<void>
}

export const useHistoryStore = create<HistoryState>((set) => ({
  matches: [],
  isLoading: false,

  loadMatches: async () => {
    set({ isLoading: true })
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { set({ isLoading: false }); return }
      const matches = await db.getUserMatches(user.id)
      set({ matches, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  deleteMatch: async (id) => {
    try {
      await db.deleteMatch(id)
      set(s => ({ matches: s.matches.filter(m => m.id !== id) }))
    } catch (e) {
      console.error('Delete failed:', e)
    }
  },
}))
