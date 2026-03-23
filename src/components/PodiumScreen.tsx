'use client'
import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Crown, Trophy, RotateCcw, Save } from 'lucide-react'
import PlayerAvatar from './PlayerAvatar'
import { calcTotals, sortByScore } from '../utils/scores'
import type { ActiveGame } from '../store/gameStore'

interface Props {
  game: ActiveGame
  onNewGame: () => void
  onSaveAndHistory: () => void
}

export default function PodiumScreen({ game, onNewGame, onSaveAndHistory }: Props) {
  const { players, rounds } = game
  const totals = useMemo(() => calcTotals(players, rounds), [players, rounds])
  const sorted = useMemo(() => sortByScore(players, totals), [players, totals])

  const podium = [sorted[1], sorted[0], sorted[2]].filter(Boolean)
  const heights = ['h-24', 'h-32', 'h-16']
  const podiumRanks = [2, 1, 3]
  const podiumDelays = [0.4, 0.6, 0.2]

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-6 pt-12 pb-8">
      {/* Title */}
      <motion.div
        className="text-center"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="text-5xl mb-3">🏆</div>
        <h1 className="font-display text-3xl font-bold gold-shimmer mb-1">Fin de partie</h1>
        <p className="text-ivory/50 text-sm">{game.matchName}</p>
        <p className="text-ivory/30 text-xs mt-1">{rounds.length} manche{rounds.length > 1 ? 's' : ''} jouée{rounds.length > 1 ? 's' : ''}</p>
      </motion.div>

      {/* Podium */}
      <div className="w-full max-w-xs">
        {/* Winner crown */}
        <motion.div
          className="flex justify-center mb-2"
          initial={{ y: -20, opacity: 0, scale: 0 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, type: 'spring', stiffness: 300, damping: 20 }}
        >
          <Crown size={32} className="text-amber-400" />
        </motion.div>

        {/* Player cards above podium */}
        <div className="flex items-end justify-center gap-3 mb-0">
          {podium.map((player, i) => {
            if (!player) return <div key={i} className="w-24" />
            return (
              <motion.div
                key={player.id}
                className="flex flex-col items-center gap-2 w-24"
                initial={{ y: -80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  delay: podiumDelays[i],
                  type: 'spring',
                  stiffness: 200,
                  damping: 18,
                }}
              >
                <PlayerAvatar
                  name={player.name}
                  color={player.color}
                  textColor={player.textColor}
                  size={podiumRanks[i] === 1 ? 'lg' : 'md'}
                />
                <div className="text-center">
                  <div className="text-ivory font-medium text-xs truncate w-20 text-center">{player.name}</div>
                  <div className="text-gold font-bold text-sm">{totals[player.id]} pts</div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Podium blocks */}
        <div className="flex items-end justify-center gap-3">
          {podium.map((player, i) => (
            <motion.div
              key={player?.id ?? i}
              className={`w-24 ${heights[i]} rounded-t-lg flex items-center justify-center text-2xl font-bold`}
              style={{
                background: podiumRanks[i] === 1
                  ? 'linear-gradient(180deg, #C9A84C, #8B6914)'
                  : podiumRanks[i] === 2
                  ? 'linear-gradient(180deg, #9BA3AF, #4B5563)'
                  : 'linear-gradient(180deg, #D97706, #92400E)',
                color: podiumRanks[i] === 1 ? '#0A0E1A' : '#fff',
                transformOrigin: 'bottom',
              }}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: podiumDelays[i] + 0.3, duration: 0.5, ease: 'easeOut' }}
            >
              {podiumRanks[i]}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Full rankings */}
      <div className="w-full max-w-sm">
        <h3 className="text-ivory/50 text-xs text-center mb-3 uppercase tracking-wider">Classement final</h3>
        <div className="space-y-2">
          {sorted.map((player, rank) => (
            <motion.div
              key={player.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.8 + rank * 0.08 }}
              className={`flex items-center gap-3 p-2.5 rounded-xl ${rank === 0 ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-white/3'}`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${rank === 0 ? 'rank-1' : rank === 1 ? 'rank-2' : rank === 2 ? 'rank-3' : 'bg-white/10 text-ivory/50'}`}>
                {rank + 1}
              </div>
              <PlayerAvatar name={player.name} color={player.color} textColor={player.textColor} size="sm" />
              <span className="text-ivory text-sm flex-1 font-medium">{player.name}</span>
              {rank === 0 && <Trophy size={14} className="text-amber-400" />}
              <span className="text-gold font-bold text-sm">{totals[player.id]} pts</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <motion.div
        className="w-full max-w-sm space-y-2"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <button
          className="btn-gold w-full py-3.5 text-base font-bold flex items-center justify-center gap-2"
          onClick={onSaveAndHistory}
        >
          <Save size={18} /> Sauvegarder & Voir l'historique
        </button>
        <button
          className="btn-ghost w-full py-3 flex items-center justify-center gap-2"
          onClick={onNewGame}
        >
          <RotateCcw size={16} /> Nouvelle Partie
        </button>
      </motion.div>
    </div>
  )
}
