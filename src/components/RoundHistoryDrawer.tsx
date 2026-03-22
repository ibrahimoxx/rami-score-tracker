import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Edit2, Trophy, ChevronDown, ChevronUp } from 'lucide-react'
import { useGameStore, type RoundScore } from '../store/gameStore'
import PlayerAvatar from './PlayerAvatar'

interface EditModalProps {
  roundIndex: number
  onClose: () => void
}

function EditRoundModal({ roundIndex, onClose }: EditModalProps) {
  const { activeGame, editLastRound } = useGameStore()
  if (!activeGame) return null

  const round = activeGame.rounds[roundIndex]
  const [scores, setScores] = useState<Record<string, number>>(
    Object.fromEntries(round.scores.map(s => [s.playerId, s.score]))
  )
  const penalties: Record<string, number> = Object.fromEntries(
    round.scores.map(s => [s.playerId, s.penalties])
  )
  const [winner, setWinner] = useState<string | null>(
    round.scores.find(s => s.isWinner)?.playerId ?? null
  )

  const handleSave = () => {
    const updated: RoundScore[] = activeGame.players.map(p => ({
      playerId: p.id,
      score: p.id === winner ? 0 : (scores[p.id] ?? 0),
      isWinner: p.id === winner,
      penalties: penalties[p.id] ?? 0,
    }))
    editLastRound(updated)
    onClose()
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="glass-card relative z-10 w-full max-w-sm p-5"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-gold font-semibold">
            ✏️ Modifier Manche {round.roundNumber}
          </h3>
          <button onClick={onClose} className="text-ivory/40 hover:text-ivory/80">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3 mb-4">
          {activeGame.players.map(p => {
            const isWin = winner === p.id
            return (
              <div key={p.id} className="flex items-center gap-2">
                <PlayerAvatar name={p.name} color={p.color} textColor={p.textColor} size="sm" />
                <span className="text-sm text-ivory/80 flex-1 truncate">{p.name}</span>
                {!isWin ? (
                  <>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={scores[p.id] ?? 0}
                      onChange={e => setScores(s => ({ ...s, [p.id]: parseInt(e.target.value) || 0 }))}
                      className="rami-input text-center w-20 py-1.5 text-sm"
                    />
                    <button
                      onClick={() => setWinner(p.id)}
                      className="btn-ghost text-xs px-2 py-1.5"
                    >
                      🏆
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setWinner(null)}
                    className="bg-amber-500 text-black text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1"
                  >
                    <Trophy size={11} /> Gagnant
                  </button>
                )}
              </div>
            )
          })}
        </div>

        <div className="flex gap-2">
          <button className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>Annuler</button>
          <button className="btn-gold flex-1 py-2.5 text-sm" onClick={handleSave}>Sauvegarder</button>
        </div>
      </motion.div>
    </motion.div>
  )
}

interface Props {
  open: boolean
  onClose: () => void
}

export default function RoundHistoryDrawer({ open, onClose }: Props) {
  const { activeGame } = useGameStore()
  const [expandedRound, setExpandedRound] = useState<number | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  if (!activeGame) return null
  const { players, rounds } = activeGame
  const lastRoundIndex = rounds.length - 1

  const playerMap = Object.fromEntries(players.map(p => [p.id, p]))

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.div
              className="fixed right-0 top-0 bottom-0 w-full max-w-sm z-40 flex flex-col"
              style={{ background: '#111827', borderLeft: '1px solid rgba(201,168,76,0.15)' }}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/5">
                <h2 className="font-display text-gold font-semibold text-lg">
                  ◆ Historique
                </h2>
                <button onClick={onClose} className="btn-ghost p-2">
                  <X size={18} />
                </button>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {rounds.length === 0 && (
                  <div className="text-center text-ivory/40 text-sm py-8">
                    Aucune manche jouée
                  </div>
                )}
                {[...rounds].reverse().map((round, revIdx) => {
                  const roundIdx = rounds.length - 1 - revIdx
                  const isLast = roundIdx === lastRoundIndex
                  const isExpanded = expandedRound === round.id as unknown as number || expandedRound === roundIdx

                  return (
                    <div
                      key={round.id}
                      className={`glass-card overflow-hidden ${isLast ? 'border-amber-500/20' : ''}`}
                    >
                      <button
                        className="w-full flex items-center justify-between p-3 text-left"
                        onClick={() => setExpandedRound(isExpanded ? null : roundIdx)}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-gold text-sm font-semibold">◆ Manche {round.roundNumber}</span>
                          {isLast && (
                            <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                              Dernière
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {isLast && (
                            <button
                              onClick={e => { e.stopPropagation(); setShowEditModal(true) }}
                              className="btn-ghost p-1.5 text-xs"
                            >
                              <Edit2 size={13} />
                            </button>
                          )}
                          {isExpanded ? <ChevronUp size={14} className="text-ivory/40" /> : <ChevronDown size={14} className="text-ivory/40" />}
                        </div>
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-3 pb-3 space-y-1.5 border-t border-white/5 pt-2">
                              {round.scores.map(s => {
                                const p = playerMap[s.playerId]
                                if (!p) return null
                                return (
                                  <div key={s.playerId} className="flex items-center gap-2">
                                    <PlayerAvatar name={p.name} color={p.color} textColor={p.textColor} size="sm" />
                                    <span className="text-ivory/80 text-sm flex-1 truncate">{p.name}</span>
                                    {s.isWinner ? (
                                      <span className="text-amber-400 text-xs font-bold flex items-center gap-1">
                                        <Trophy size={11} /> Gagnant
                                      </span>
                                    ) : (
                                      <div className="text-right">
                                        <span className="text-ivory/70 text-sm font-medium">{s.score}</span>
                                        {s.penalties > 0 && (
                                          <span className="text-red-400 text-xs ml-1">+{s.penalties}</span>
                                        )}
                                        <span className="text-ivory/30 text-xs ml-1">pts</span>
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEditModal && (
          <EditRoundModal
            roundIndex={lastRoundIndex}
            onClose={() => setShowEditModal(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
