import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Crown, Zap, TrendingUp, Award } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts'
import { useGameStore } from '../store/gameStore'
import { calcTotals, sortByScore, getWinCounts } from '../utils/scores'
import PlayerAvatar from './PlayerAvatar'

const CHART_COLORS = ['#C9A84C', '#C0392B', '#3498DB', '#2ECC71', '#9B59B6', '#E67E22']

type Tab = 'overview' | 'evolution' | 'records'

interface Props {
  open: boolean
  onClose: () => void
}

export default function StatsModal({ open, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('overview')
  const { activeGame } = useGameStore()

  const data = useMemo(() => {
    if (!activeGame) return null
    const { players, rounds } = activeGame
    const totals = calcTotals(players, rounds)
    const sorted = sortByScore(players, totals)
    const wins = getWinCounts(players, rounds)

    // Evolution data: cumulative score per round
    const evolution = rounds.map((_round, idx) => {
      const point: Record<string, number | string> = { name: `M${idx + 1}` }
      // Running totals up to this round
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

    // Records
    let lowestRoundScore = { player: '', score: Infinity, round: 0 }
    let highestPenalty = { player: '', penalty: 0 }
    players.forEach(p => {
      rounds.forEach((r, idx) => {
        const s = r.scores.find(sc => sc.playerId === p.id)
        if (!s || s.isWinner) return
        const total = s.score + s.penalties
        if (total < lowestRoundScore.score) lowestRoundScore = { player: p.name, score: total, round: idx + 1 }
        if (s.penalties > highestPenalty.penalty) highestPenalty = { player: p.name, penalty: s.penalties }
      })
    })

    return { players, totals, sorted, wins, evolution, lowestRoundScore, highestPenalty, rounds }
  }, [activeGame])

  if (!data) return null

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Vue d\'ensemble' },
    { id: 'evolution', label: 'Évolution' },
    { id: 'records', label: 'Records' },
  ]

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className="relative z-10 w-full sm:max-w-lg bg-bg-secondary rounded-t-2xl sm:rounded-2xl flex flex-col"
            style={{ maxHeight: '90dvh', background: '#111827', border: '1px solid rgba(201,168,76,0.15)' }}
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5 flex-shrink-0">
              <h2 className="font-display text-gold font-semibold text-lg">Statistiques</h2>
              <button onClick={onClose} className="btn-ghost p-2"><X size={18} /></button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-3 border-b border-white/5 flex-shrink-0">
              {tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all ${
                    tab === t.id ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-ivory/50 hover:text-ivory/80'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {tab === 'overview' && (
                <div className="space-y-3">
                  {data.sorted.map((player, rank) => {
                    const total = data.totals[player.id] ?? 0
                    const wins = data.wins[player.id] ?? 0
                    const winRate = data.rounds.length > 0
                      ? Math.round((wins / data.rounds.length) * 100)
                      : 0
                    return (
                      <motion.div
                        key={player.id}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: rank * 0.07 }}
                        className={`p-3 rounded-xl border ${rank === 0 ? 'bg-amber-500/8 border-amber-500/20' : 'bg-white/3 border-white/5'}`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${rank === 0 ? 'rank-1' : rank === 1 ? 'rank-2' : rank === 2 ? 'rank-3' : 'bg-white/10 text-ivory/50'}`}>
                            {rank + 1}
                          </div>
                          <PlayerAvatar name={player.name} color={player.color} textColor={player.textColor} size="sm" />
                          <span className="font-medium text-ivory flex-1">{player.name}</span>
                          {rank === 0 && <Crown size={14} className="text-amber-400" />}
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="bg-white/4 rounded-lg p-2">
                            <div className="text-gold font-bold text-lg">{total}</div>
                            <div className="text-ivory/40 text-xs">pts total</div>
                          </div>
                          <div className="bg-white/4 rounded-lg p-2">
                            <div className="text-amber-400 font-bold text-lg">{wins}</div>
                            <div className="text-ivory/40 text-xs">victoire{wins > 1 ? 's' : ''}</div>
                          </div>
                          <div className="bg-white/4 rounded-lg p-2">
                            <div className="text-green-400 font-bold text-lg">{winRate}%</div>
                            <div className="text-ivory/40 text-xs">win rate</div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}

              {tab === 'evolution' && (
                <div>
                  {data.evolution.length === 0 ? (
                    <div className="text-center text-ivory/40 py-8 text-sm">Aucune manche jouée</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={260}>
                      <LineChart data={data.evolution} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="name" stroke="rgba(245,240,232,0.3)" tick={{ fontSize: 11 }} />
                        <YAxis stroke="rgba(245,240,232,0.3)" tick={{ fontSize: 11 }} />
                        <Tooltip
                          contentStyle={{ background: '#1A2035', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 8 }}
                          labelStyle={{ color: '#C9A84C', fontWeight: 600 }}
                          itemStyle={{ color: '#F5F0E8' }}
                        />
                        <Legend wrapperStyle={{ color: '#F5F0E8', fontSize: 11 }} />
                        {data.players.map((p, i) => (
                          <Line
                            key={p.id}
                            type="monotone"
                            dataKey={p.name}
                            stroke={CHART_COLORS[i % CHART_COLORS.length]}
                            strokeWidth={2}
                            dot={{ r: 4, fill: CHART_COLORS[i % CHART_COLORS.length] }}
                            activeDot={{ r: 6 }}
                            animationDuration={800}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                  <p className="text-ivory/30 text-xs text-center mt-2">Score cumulatif (plus bas = meilleur)</p>
                </div>
              )}

              {tab === 'records' && (
                <div className="space-y-3">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0 }}
                    className="glass-card p-4 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Zap size={18} className="text-green-400" />
                    </div>
                    <div>
                      <div className="text-ivory/50 text-xs mb-0.5">Meilleur score en une manche</div>
                      {data.lowestRoundScore.score === Infinity ? (
                        <div className="text-ivory/30 text-sm">Aucune donnée</div>
                      ) : (
                        <div className="text-ivory font-semibold">{data.lowestRoundScore.player} — {data.lowestRoundScore.score} pts (M{data.lowestRoundScore.round})</div>
                      )}
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.08 }}
                    className="glass-card p-4 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                      <TrendingUp size={18} className="text-red-400" />
                    </div>
                    <div>
                      <div className="text-ivory/50 text-xs mb-0.5">Plus grande pénalité reçue</div>
                      {data.highestPenalty.penalty === 0 ? (
                        <div className="text-ivory/30 text-sm">Aucune pénalité</div>
                      ) : (
                        <div className="text-ivory font-semibold">{data.highestPenalty.player} — +{data.highestPenalty.penalty} pts</div>
                      )}
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.16 }}
                    className="glass-card p-4 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <Award size={18} className="text-amber-400" />
                    </div>
                    <div>
                      <div className="text-ivory/50 text-xs mb-0.5">Meilleur joueur (+ de victoires)</div>
                      {(() => {
                        const maxWins = Math.max(...Object.values(data.wins))
                        if (maxWins === 0) return <div className="text-ivory/30 text-sm">Aucune victoire</div>
                        const best = data.players.find(p => data.wins[p.id] === maxWins)
                        return <div className="text-ivory font-semibold">{best?.name} — {maxWins} victoire{maxWins > 1 ? 's' : ''}</div>
                      })()}
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.24 }}
                    className="glass-card p-4 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                      <Crown size={18} className="text-gold" />
                    </div>
                    <div>
                      <div className="text-ivory/50 text-xs mb-0.5">Leader actuel</div>
                      <div className="text-ivory font-semibold flex items-center gap-1.5">
                        {data.sorted[0]?.name}
                        <span className="text-gold text-sm">— {data.totals[data.sorted[0]?.id] ?? 0} pts</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
