'use client'
import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, CheckCircle, X } from 'lucide-react'
import confetti from 'canvas-confetti'
import PlayerAvatar from './PlayerAvatar'
import { useGameStore, type RoundScore } from '../store/gameStore'
import { useToastStore } from '../store/toastStore'
import { calcTotals } from '../utils/scores'

interface Props {
  onRoundAdded?: () => void
}

const MILESTONE_THRESHOLDS = [100, 200, 500]

export default function RoundInputPanel({ onRoundAdded }: Props) {
  const { activeGame, addRound } = useGameStore()
  const { addToast } = useToastStore()

  const [scores, setScores] = useState<Record<string, number>>({})
  // penalties stored as array of individual items per player so each can be removed
  const [penaltyItems, setPenaltyItems] = useState<Record<string, number[]>>({})
  const [winner, setWinner] = useState<string | null>(null)
  const [shakingPenalty, setShakingPenalty] = useState<string | null>(null)
  const submitBtnRef = useRef<HTMLButtonElement>(null)

  const players = activeGame?.players ?? []
  const rounds = activeGame?.rounds ?? []
  const currentRound = rounds.length + 1
  const currentTotals = calcTotals(players, rounds)

  const setScore = (playerId: string, value: number) => {
    setScores(s => ({ ...s, [playerId]: isNaN(value) ? 0 : value }))
  }

  const addPenalty = (playerId: string, amount: number) => {
    setPenaltyItems(p => ({ ...p, [playerId]: [...(p[playerId] ?? []), amount] }))
    setShakingPenalty(`${playerId}-${amount}`)
    setTimeout(() => setShakingPenalty(null), 400)
  }

  const removePenalty = (playerId: string, idx: number) => {
    setPenaltyItems(p => {
      const items = [...(p[playerId] ?? [])]
      items.splice(idx, 1)
      return { ...p, [playerId]: items }
    })
  }

  const toggleWinner = (playerId: string) => {
    setWinner(w => w === playerId ? null : playerId)
  }

  const handleSubmit = useCallback(() => {
    if (!activeGame) return

    const roundScores: RoundScore[] = players.map(p => {
      const items = penaltyItems[p.id] ?? []
      const penTotal = items.reduce((a, b) => a + b, 0)
      return {
        playerId: p.id,
        score: p.id === winner ? 0 : (scores[p.id] ?? 0),
        isWinner: p.id === winner,
        penalties: penTotal,
      }
    })

    // Check milestones
    players.forEach(p => {
      const prev = currentTotals[p.id] ?? 0
      const added = roundScores.find(s => s.playerId === p.id)!
      const newTotal = prev + added.score + added.penalties
      MILESTONE_THRESHOLDS.forEach(threshold => {
        if (prev < threshold && newTotal >= threshold) {
          addToast(`⚠️ ${p.name} dépasse les ${threshold} pts!`, 'warning')
        }
      })
    })

    addRound(roundScores)

    // Confetti
    if (submitBtnRef.current) {
      const rect = submitBtnRef.current.getBoundingClientRect()
      confetti({
        particleCount: 80,
        spread: 70,
        origin: {
          x: (rect.left + rect.width / 2) / window.innerWidth,
          y: (rect.top + rect.height / 2) / window.innerHeight,
        },
        colors: ['#C9A84C', '#E8C97A', '#fff9e6', '#C0392B', '#2ECC71'],
        ticks: 150,
      })
    }

    // Reset
    setScores({})
    setPenaltyItems({})
    setWinner(null)
    onRoundAdded?.()
  }, [activeGame, players, scores, penaltyItems, winner, currentTotals, addRound, addToast, onRoundAdded])

  if (!activeGame) return null

  return (
    <div className="glass-card p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-gold font-semibold">
          Manche {currentRound}
        </h3>
        <span className="text-xs text-ivory/40 bg-white/5 px-2 py-1 rounded-full">
          Entrer les points
        </span>
      </div>

      {/* Player rows */}
      <div className="space-y-3">
        {players.map(player => {
          const isWin = winner === player.id
          const items = penaltyItems[player.id] ?? []
          const pen = items.reduce((a, b) => a + b, 0)
          const baseScore = isWin ? 0 : (scores[player.id] ?? '')
          const displayTotal = isWin ? 0 : ((scores[player.id] ?? 0) + pen)

          return (
            <motion.div
              key={player.id}
              layout
              className={`p-3 rounded-xl border transition-all ${
                isWin
                  ? 'bg-amber-500/10 border-amber-500/30 winner-glow'
                  : 'bg-white/3 border-white/5'
              }`}
            >
              {/* Top row: avatar + name + winner btn */}
              <div className="flex items-center gap-2 mb-2">
                <PlayerAvatar
                  name={player.name}
                  color={player.color}
                  textColor={player.textColor}
                  size="sm"
                />
                <span className="text-ivory font-medium text-sm flex-1 truncate">
                  {player.name}
                </span>

                {/* Winner toggle */}
                <AnimatePresence mode="wait">
                  {isWin ? (
                    <motion.button
                      key="win"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      onClick={() => toggleWinner(player.id)}
                      className="flex items-center gap-1 bg-amber-500 text-black text-xs font-bold px-3 py-1.5 rounded-full"
                    >
                      <Trophy size={12} /> Gagnant
                    </motion.button>
                  ) : (
                    <motion.button
                      key="no-win"
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0.9 }}
                      onClick={() => toggleWinner(player.id)}
                      className="btn-ghost text-xs px-3 py-1.5"
                    >
                      🏆 Gagnant ?
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              {/* Score input row */}
              {!isWin && (
                <div className="flex items-center gap-2">
                  {/* Score input */}
                  <input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="0"
                    value={baseScore}
                    onChange={e => setScore(player.id, parseInt(e.target.value))}
                    className="rami-input text-center text-lg font-bold py-2 flex-1"
                  />

                  {/* Penalty buttons */}
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => addPenalty(player.id, 11)}
                    className={`text-xs font-bold px-3 py-2 rounded-lg bg-orange-600/80 text-white border border-orange-500/40 flex-shrink-0 ${
                      shakingPenalty === `${player.id}-11` ? 'animate-shake' : ''
                    }`}
                  >
                    +11
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => addPenalty(player.id, 51)}
                    className={`text-xs font-bold px-3 py-2 rounded-lg bg-red-card/90 text-white border border-red-700/40 flex-shrink-0 ${
                      shakingPenalty === `${player.id}-51` ? 'animate-shake' : ''
                    }`}
                  >
                    +51
                  </motion.button>
                </div>
              )}

              {/* Penalty chips — each one removable */}
              {!isWin && items.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <AnimatePresence>
                    {items.map((amt, idx) => (
                      <motion.button
                        key={idx}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                        onClick={() => removePenalty(player.id, idx)}
                        className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full text-white border"
                        style={{
                          background: amt === 51 ? 'rgba(192,57,43,0.7)' : 'rgba(234,88,12,0.7)',
                          borderColor: amt === 51 ? 'rgba(185,28,28,0.5)' : 'rgba(234,88,12,0.5)',
                        }}
                        title="Appuyer pour annuler"
                      >
                        +{amt}
                        <X size={10} strokeWidth={3} className="opacity-80" />
                      </motion.button>
                    ))}
                  </AnimatePresence>
                  <span className="self-center text-xs text-ivory/30 ml-1">
                    = <span className="text-red-400 font-semibold">+{pen}</span>
                  </span>
                </div>
              )}

              {/* Total preview */}
              {!isWin && (pen > 0 || (scores[player.id] ?? 0) > 0) && (
                <div className="mt-1.5 text-right text-xs text-ivory/40">
                  Total manche : <span className="text-ivory/70 font-medium">{displayTotal} pts</span>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Submit */}
      <motion.button
        ref={submitBtnRef}
        whileTap={{ scale: 0.97 }}
        onClick={handleSubmit}
        className="btn-gold w-full mt-4 py-3.5 text-base font-bold flex items-center justify-center gap-2 relative overflow-hidden"
      >
        <CheckCircle size={18} />
        Valider la manche →
      </motion.button>
    </div>
  )
}
