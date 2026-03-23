'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart2, Clock, LogOut } from 'lucide-react'
import ScoreBoard from '../components/ScoreBoard'
import RoundInputPanel from '../components/RoundInputPanel'
import RoundHistoryDrawer from '../components/RoundHistoryDrawer'
import StatsModal from '../components/StatsModal'
import ConfirmDialog from '../components/ConfirmDialog'
import { useGameStore } from '../store/gameStore'

interface Props {
  onEndGame: () => void
}

export default function GameScreen({ onEndGame }: Props) {
  const { activeGame } = useGameStore()
  const [showHistory, setShowHistory] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [showEndConfirm, setShowEndConfirm] = useState(false)
  const [scoreBounce, setScoreBounce] = useState(false)

  if (!activeGame) return null
  const { matchName, rounds } = activeGame
  const currentRound = rounds.length + 1

  const handleRoundAdded = () => {
    setScoreBounce(true)
    setTimeout(() => setScoreBounce(false), 600)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      {/* Top Bar */}
      <div
        className="sticky top-0 z-20 px-4 py-3 flex items-center gap-3"
        style={{ background: 'rgba(10,14,26,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(201,168,76,0.1)' }}
      >
        {/* Match name — long press for settings */}
        <div className="flex-1 min-w-0">
          <h1 className="font-display font-semibold text-ivory truncate text-sm">{matchName}</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-gold font-medium">Manche {currentRound}</span>
            {rounds.length > 0 && (
              <span className="text-xs text-ivory/30">· {rounds.length} jouée{rounds.length > 1 ? 's' : ''}</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowHistory(true)}
            className="btn-ghost p-2.5 relative"
          >
            <Clock size={17} />
            {rounds.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold text-black text-xs font-bold rounded-full flex items-center justify-center">
                {rounds.length}
              </span>
            )}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowStats(true)}
            className="btn-ghost p-2.5"
          >
            <BarChart2 size={17} />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowEndConfirm(true)}
            className="p-2.5 rounded-lg bg-red-card/20 border border-red-card/30 text-red-400"
          >
            <LogOut size={17} />
          </motion.button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-8">
        {/* Scoreboard */}
        <motion.div
          animate={scoreBounce ? { scale: [1, 1.02, 1] } : {}}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-ivory/50 text-xs uppercase tracking-wider">Classement</h2>
            <span className="text-xs text-ivory/30">Plus bas = meilleur</span>
          </div>
          <ScoreBoard />
        </motion.div>

        {/* Round input */}
        <div>
          <h2 className="text-ivory/50 text-xs uppercase tracking-wider mb-2">Saisie de la manche</h2>
          <RoundInputPanel onRoundAdded={handleRoundAdded} />
        </div>

        {/* End game */}
        <div className="text-center pt-2">
          <button
            onClick={() => setShowEndConfirm(true)}
            className="text-red-400/60 text-xs hover:text-red-400/90 transition-colors underline underline-offset-2"
          >
            Terminer la partie
          </button>
        </div>
      </div>

      {/* Drawers & Modals */}
      <RoundHistoryDrawer open={showHistory} onClose={() => setShowHistory(false)} />
      <StatsModal open={showStats} onClose={() => setShowStats(false)} />

      <ConfirmDialog
        open={showEndConfirm}
        title="Terminer la partie ?"
        message="La partie sera terminée et les scores finaux affichés. Cette action est irréversible."
        confirmLabel="Terminer"
        onConfirm={() => { setShowEndConfirm(false); onEndGame() }}
        onCancel={() => setShowEndConfirm(false)}
        danger
      />
    </div>
  )
}
