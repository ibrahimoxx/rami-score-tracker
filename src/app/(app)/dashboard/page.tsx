'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import HistoryScreen from '@/screens/HistoryScreen'
import FloatingCardBackground from '@/components/FloatingCardBackground'
import { useHistoryStore } from '@/store/historyStore'
import { useGameStore } from '@/store/gameStore'
import type { SavedMatch } from '@/store/historyStore'

export default function DashboardPage() {
  const router = useRouter()
  const { loadMatches } = useHistoryStore()
  const { activeGame, loadActiveGame } = useGameStore()

  useEffect(() => {
    loadMatches()
    loadActiveGame()
  }, [loadMatches, loadActiveGame])

  const handleViewMatch = (match: SavedMatch) => {
    router.push(`/match/${match.id}`)
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <FloatingCardBackground />

      {/* Active game resume banner */}
      {activeGame && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative z-10 mx-4 mt-4"
        >
          <div className="glass-card p-4 border-amber-500/30 border flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
              <div>
                <p className="text-ivory/80 text-sm font-medium">Partie en cours</p>
                <p className="text-ivory/40 text-xs">{activeGame.matchName} · Manche {activeGame.rounds.length + 1}</p>
              </div>
            </div>
            <button onClick={() => router.push('/game')} className="btn-gold px-4 py-2 text-sm font-semibold flex-shrink-0">
              Reprendre →
            </button>
          </div>
        </motion.div>
      )}

      {/* History screen renders the match list */}
      <HistoryScreen
        onBack={() => router.push('/game')}
        onViewMatch={handleViewMatch}
      />

      {/* Floating "New Game" button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => router.push('/game')}
        className="fixed bottom-6 right-6 z-20 btn-gold px-5 py-3.5 text-sm font-bold flex items-center gap-2 rounded-2xl"
        style={{ boxShadow: '0 8px 32px rgba(201,168,76,0.4)' }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.4, type: 'spring', stiffness: 300, damping: 20 }}
      >
        <Plus size={18} /> Nouvelle Partie
      </motion.button>
    </div>
  )
}
