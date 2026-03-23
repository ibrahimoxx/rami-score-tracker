'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, History } from 'lucide-react'
import FloatingCardBackground from '../components/FloatingCardBackground'

interface Props {
  onStart: (matchName: string) => void
  onHistory: () => void
  hasActiveGame: boolean
  onResume: () => void
}

export default function WelcomeScreen({ onStart, onHistory, hasActiveGame, onResume }: Props) {
  const [matchName, setMatchName] = useState('')

  const handleSubmit = () => {
    const name = matchName.trim() || 'Partie sans nom'
    onStart(name)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-6 pt-0 relative overflow-hidden">
      <FloatingCardBackground />

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm relative z-10">
        {/* Logo */}
        <motion.div
          className="text-center mb-10"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {/* Card suits ornament */}
          <motion.div
            className="text-3xl mb-4 space-x-3"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
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
          <p className="text-ivory/40 text-sm mt-3 tracking-wider uppercase">
            Score Tracker
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          className="w-full space-y-4"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {/* Active game resume */}
          {hasActiveGame && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-4 border-amber-500/30 border"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-ivory/70 text-sm font-medium">Partie en cours</span>
              </div>
              <button
                onClick={onResume}
                className="btn-gold w-full py-3 font-semibold"
              >
                Reprendre la partie →
              </button>
            </motion.div>
          )}

          {/* New match form */}
          <div className="glass-card p-5 space-y-4">
            <div>
              <label className="text-ivory/60 text-sm mb-2 block">Nom du match / partie</label>
              <input
                type="text"
                value={matchName}
                onChange={e => setMatchName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="Ex: Soirée du vendredi"
                className="rami-input"
                autoComplete="off"
              />
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSubmit}
              className="btn-gold w-full py-3.5 text-base font-bold flex items-center justify-center gap-2"
            >
              Commencer <ArrowRight size={18} />
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Bottom: history link */}
      <motion.div
        className="relative z-10 pb-safe"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <button
          onClick={onHistory}
          className="btn-ghost flex items-center gap-2 px-5 py-2.5 text-sm"
        >
          <History size={16} /> Parties précédentes
        </button>
      </motion.div>
    </div>
  )
}
