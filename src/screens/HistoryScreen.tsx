'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Trash2, Trophy, Calendar, Users } from 'lucide-react'
import { useHistoryStore } from '../store/historyStore'
import ConfirmDialog from '../components/ConfirmDialog'
import PlayerAvatar from '../components/PlayerAvatar'
import { calcTotals, sortByScore } from '../utils/scores'
import type { SavedMatch } from '../store/historyStore'

interface Props {
  onBack: () => void
  onViewMatch: (match: SavedMatch) => void
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

export default function HistoryScreen({ onBack, onViewMatch }: Props) {
  const { matches, deleteMatch } = useHistoryStore()
  const [toDelete, setToDelete] = useState<string | null>(null)

  return (
    <div className="min-h-screen flex flex-col p-4">
      {/* Header */}
      <motion.div
        className="flex items-center gap-3 mb-6 pt-2"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
      >
        <button onClick={onBack} className="btn-ghost p-2.5">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="font-display text-xl font-bold text-ivory">Parties sauvegardées</h1>
          <p className="text-ivory/40 text-xs">{matches.length} partie{matches.length > 1 ? 's' : ''}</p>
        </div>
      </motion.div>

      {/* Empty state */}
      {matches.length === 0 && (
        <motion.div
          className="flex-1 flex flex-col items-center justify-center text-center px-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-6xl mb-4">🃏</div>
          <div className="text-5xl mb-2 space-x-2 opacity-20">♠ ♥ ♦ ♣</div>
          <h3 className="font-display text-xl font-semibold text-ivory/60 mb-2">
            Aucune partie sauvegardée
          </h3>
          <p className="text-ivory/30 text-sm">
            Lancez votre première partie pour la retrouver ici !
          </p>
        </motion.div>
      )}

      {/* Match list */}
      <div className="space-y-3">
        <AnimatePresence>
          {matches.map((match, idx) => {
            const totals = calcTotals(match.players, match.rounds)
            const sorted = sortByScore(match.players, totals)
            const winner = sorted[0]

            return (
              <motion.div
                key={match.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => onViewMatch(match)}
                className="glass-card p-4 cursor-pointer hover:border-amber-500/30 transition-colors active:scale-[0.99]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Name */}
                    <h3 className="font-semibold text-ivory truncate mb-1">{match.matchName}</h3>

                    {/* Meta */}
                    <div className="flex items-center gap-3 text-xs text-ivory/40 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar size={11} /> {formatDate(match.finishedAt ?? match.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={11} /> {match.players.length} joueurs
                      </span>
                      <span>{match.rounds.length} manches</span>
                    </div>

                    {/* Players avatars */}
                    <div className="flex items-center gap-1.5">
                      {match.players.slice(0, 5).map(p => (
                        <PlayerAvatar key={p.id} name={p.name} color={p.color} textColor={p.textColor} size="sm" />
                      ))}
                      {match.players.length > 5 && (
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs text-ivory/50">
                          +{match.players.length - 5}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {/* Winner */}
                    {winner && (
                      <div className="flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/25 rounded-full px-2.5 py-1">
                        <Trophy size={11} className="text-amber-400" />
                        <span className="text-amber-400 text-xs font-medium truncate max-w-[80px]">{winner.name}</span>
                      </div>
                    )}
                    {/* Score */}
                    {winner && (
                      <span className="text-gold font-bold text-sm">{totals[winner.id]} pts</span>
                    )}
                    {/* Delete */}
                    <button
                      onClick={e => { e.stopPropagation(); setToDelete(match.id) }}
                      className="p-1.5 rounded-lg text-red-400/50 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      <ConfirmDialog
        open={toDelete !== null}
        title="Supprimer la partie ?"
        message="Cette action est irréversible. Toutes les données de cette partie seront supprimées."
        confirmLabel="Supprimer"
        onConfirm={() => { if (toDelete) deleteMatch(toDelete); setToDelete(null) }}
        onCancel={() => setToDelete(null)}
        danger
      />
    </div>
  )
}
