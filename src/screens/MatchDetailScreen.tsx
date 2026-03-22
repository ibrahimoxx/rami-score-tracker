import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Trophy, ChevronDown, ChevronUp } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts'
import PlayerAvatar from '../components/PlayerAvatar'
import { calcTotals, sortByScore, getWinCounts } from '../utils/scores'
import type { SavedMatch } from '../store/historyStore'

const CHART_COLORS = ['#C9A84C', '#C0392B', '#3498DB', '#2ECC71', '#9B59B6', '#E67E22']

interface Props {
  match: SavedMatch
  onBack: () => void
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export default function MatchDetailScreen({ match, onBack }: Props) {
  const [expandedRound, setExpandedRound] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'scores' | 'chart'>('scores')

  const { players, rounds } = match
  const totals = useMemo(() => calcTotals(players, rounds), [players, rounds])
  const sorted = useMemo(() => sortByScore(players, totals), [players, totals])
  const wins = useMemo(() => getWinCounts(players, rounds), [players, rounds])

  const evolution = rounds.map((_round, idx) => {
    const point: Record<string, number | string> = { name: `M${idx + 1}` }
    players.forEach(p => {
      let cum = 0
      for (let r = 0; r <= idx; r++) {
        const s = rounds[r].scores.find(sc => sc.playerId === p.id)
        if (s) cum += s.score + s.penalties
      }
      point[p.name] = cum
    })
    return point
  })

  const playerMap = Object.fromEntries(players.map(p => [p.id, p]))

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div
        className="sticky top-0 z-20 px-4 py-3"
        style={{ background: 'rgba(10,14,26,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(201,168,76,0.1)' }}
      >
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="btn-ghost p-2.5">
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-display font-bold text-ivory truncate">{match.matchName}</h1>
            <p className="text-ivory/30 text-xs">{formatDate(match.finishedAt ?? match.createdAt)}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-8">
        {/* Winner banner */}
        <motion.div
          className="glass-card p-4 flex items-center gap-3 border-amber-500/25"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
            <Trophy size={22} className="text-amber-400" />
          </div>
          <div>
            <div className="text-ivory/50 text-xs mb-0.5">Vainqueur</div>
            <div className="font-display text-lg font-bold text-amber-400">{sorted[0]?.name}</div>
            <div className="text-ivory/40 text-xs">{totals[sorted[0]?.id]} pts · {rounds.length} manches</div>
          </div>
        </motion.div>

        {/* Final ranking */}
        <div>
          <h2 className="text-ivory/50 text-xs uppercase tracking-wider mb-2">Classement final</h2>
          <div className="space-y-2">
            {sorted.map((player, rank) => (
              <motion.div
                key={player.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: rank * 0.06 }}
                className={`flex items-center gap-3 p-2.5 rounded-xl ${rank === 0 ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-white/3'}`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${rank === 0 ? 'rank-1' : rank === 1 ? 'rank-2' : rank === 2 ? 'rank-3' : 'bg-white/10 text-ivory/50'}`}>
                  {rank + 1}
                </div>
                <PlayerAvatar name={player.name} color={player.color} textColor={player.textColor} size="sm" />
                <span className="text-ivory text-sm flex-1 font-medium">{player.name}</span>
                <div className="text-right">
                  <div className="text-gold font-bold text-sm">{totals[player.id]} pts</div>
                  {wins[player.id] > 0 && (
                    <div className="text-xs text-ivory/30">🏆 {wins[player.id]}</div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Tabs: Scores | Chart */}
        <div>
          <div className="flex gap-1 mb-3">
            {(['scores', 'chart'] as const).map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === t ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-ivory/40 bg-white/3'
                }`}
              >
                {t === 'scores' ? '📋 Historique' : '📈 Évolution'}
              </button>
            ))}
          </div>

          {activeTab === 'scores' && (
            <div className="space-y-2">
              {[...rounds].reverse().map((round, revIdx) => {
                const rIdx = rounds.length - 1 - revIdx
                const isExpanded = expandedRound === rIdx
                return (
                  <div key={round.id} className="glass-card overflow-hidden">
                    <button
                      className="w-full flex items-center justify-between p-3 text-left"
                      onClick={() => setExpandedRound(isExpanded ? null : rIdx)}
                    >
                      <span className="text-gold text-sm font-semibold">◆ Manche {round.roundNumber}</span>
                      {isExpanded ? <ChevronUp size={14} className="text-ivory/40" /> : <ChevronDown size={14} className="text-ivory/40" />}
                    </button>
                    {isExpanded && (
                      <div className="px-3 pb-3 border-t border-white/5 pt-2 space-y-1.5">
                        {round.scores.map(s => {
                          const p = playerMap[s.playerId]
                          if (!p) return null
                          return (
                            <div key={s.playerId} className="flex items-center gap-2">
                              <PlayerAvatar name={p.name} color={p.color} textColor={p.textColor} size="sm" />
                              <span className="text-ivory/80 text-sm flex-1">{p.name}</span>
                              {s.isWinner ? (
                                <span className="text-amber-400 text-xs font-bold">🏆 Gagnant</span>
                              ) : (
                                <div className="text-right">
                                  <span className="text-ivory/70 text-sm">{s.score}</span>
                                  {s.penalties > 0 && <span className="text-red-400 text-xs ml-1">+{s.penalties}</span>}
                                  <span className="text-ivory/30 text-xs ml-1">pts</span>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'chart' && (
            <div className="glass-card p-4">
              {evolution.length === 0 ? (
                <p className="text-ivory/30 text-sm text-center py-6">Aucune donnée</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={evolution} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="rgba(245,240,232,0.3)" tick={{ fontSize: 11 }} />
                    <YAxis stroke="rgba(245,240,232,0.3)" tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ background: '#1A2035', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 8 }}
                      labelStyle={{ color: '#C9A84C', fontWeight: 600 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    {players.map((p, i) => (
                      <Line
                        key={p.id}
                        type="monotone"
                        dataKey={p.name}
                        stroke={CHART_COLORS[i % CHART_COLORS.length]}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        animationDuration={600}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              )}
              <p className="text-ivory/30 text-xs text-center mt-2">Plus bas = meilleur</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
