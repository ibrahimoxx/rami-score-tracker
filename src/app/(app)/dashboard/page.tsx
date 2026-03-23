'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import FloatingCardBackground from '@/components/FloatingCardBackground'
import HistoryScreen from '@/screens/HistoryScreen'
import { useHistoryStore, type SavedMatch } from '@/store/historyStore'
import { useGameStore } from '@/store/gameStore'

export default function DashboardPage() {
  const router = useRouter()
  const { loadMatches } = useHistoryStore()
  const { activeGame, loadActiveGame } = useGameStore()
  const [matchName, setMatchName] = useState('')

  useEffect(() => {
    loadMatches()
    loadActiveGame()
  }, [loadMatches, loadActiveGame])

  const handleStart = () => {
    const name = matchName.trim() || 'Partie sans nom'
    router.push(`/game/setup?match=${encodeURIComponent(name)}`)
  }

  const handleViewMatch = (match: SavedMatch) => {
    router.push(`/match/${match.id}`)
  }

  return (
    <div className="min-h-screen lg:h-[calc(100vh-56px)] flex flex-col lg:flex-row relative overflow-hidden">
      <FloatingCardBackground />

      {/* ── LEFT: RAMI logo + new game form ── */}
      <motion.div
        className="lg:w-[44%] flex flex-col items-center justify-center px-8 py-12 relative z-10 flex-shrink-0"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <motion.div
          className="text-center mb-10"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <motion.div
            className="text-3xl mb-4 space-x-3"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.25, type: 'spring', stiffness: 200 }}
          >
            <span style={{ color: '#C9A84C' }}>♠</span>
            <span style={{ color: '#C0392B' }}>♥</span>
            <span style={{ color: '#C9A84C' }}>♦</span>
            <span style={{ color: '#C0392B' }}>♣</span>
          </motion.div>
          <h1
            className="font-display text-8xl font-bold gold-shimmer tracking-widest"
            style={{ letterSpacing: '0.15em' }}
          >
            RAMI
          </h1>
          <p className="text-ivory/40 text-sm mt-3 tracking-wider uppercase">Score Tracker</p>
        </motion.div>

        {/* Active game resume banner */}
        <AnimatePresence>
          {activeGame && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card p-4 border-amber-500/30 border w-full max-w-sm mb-4"
            >
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
                <div>
                  <p className="text-ivory/80 text-sm font-medium">Partie en cours</p>
                  <p className="text-ivory/40 text-xs">
                    {activeGame.matchName} · Manche {activeGame.rounds.length + 1}
                  </p>
                </div>
              </div>
              <button
                onClick={() => router.push('/game')}
                className="btn-gold w-full py-3 font-semibold text-sm"
              >
                Reprendre la partie →
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* New game form */}
        <motion.div
          className="glass-card p-5 space-y-4 w-full max-w-sm"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div>
            <label className="text-ivory/60 text-sm mb-2 block">Nom du match / partie</label>
            <input
              type="text"
              value={matchName}
              onChange={e => setMatchName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleStart()}
              placeholder="Ex: Soirée du vendredi"
              className="rami-input"
              autoComplete="off"
            />
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleStart}
            className="btn-gold w-full py-3.5 text-base font-bold flex items-center justify-center gap-2"
          >
            Commencer <ArrowRight size={18} />
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Vertical divider (desktop) */}
      <div className="hidden lg:block w-px bg-white/5 my-10 flex-shrink-0" />

      {/* Horizontal divider (mobile) */}
      <div className="lg:hidden h-px bg-white/5 mx-6 flex-shrink-0" />

      {/* ── RIGHT: Saved matches ── */}
      <motion.div
        className="flex-1 relative z-10 overflow-y-auto"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <HistoryScreen
          onBack={() => {}}
          onViewMatch={handleViewMatch}
          hideBack
        />
      </motion.div>
    </div>
  )
}
