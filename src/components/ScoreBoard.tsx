'use client'
import { useMemo, useRef, useEffect } from 'react'
import { Crown } from 'lucide-react'
import PlayerAvatar from './PlayerAvatar'
import { useGameStore } from '../store/gameStore'
import { calcTotals, sortByScore, getWinCounts, getRoundDelta } from '../utils/scores'

export default function ScoreBoard() {
  const { activeGame } = useGameStore()
  const players = activeGame?.players ?? []
  const rounds = activeGame?.rounds ?? []
  const totals = useMemo(() => calcTotals(players, rounds), [players, rounds])
  const sorted = useMemo(() => sortByScore(players, totals), [players, totals])
  const wins = useMemo(() => getWinCounts(players, rounds), [players, rounds])
  const prevTotalsRef = useRef<Record<string, number>>({})

  useEffect(() => {
    prevTotalsRef.current = totals
  })

  if (!activeGame) return null

  return (
    <div className="glass-card p-3">
      <div className="space-y-2">
        {sorted.map((player, rank) => {
          const total = totals[player.id] ?? 0
          const lastRoundDelta = rounds.length > 0
            ? getRoundDelta(player.id, rounds, rounds.length - 1)
            : null

          return (
            <div
              key={player.id}
              className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                rank === 0 ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-white/3'
              }`}
            >
              {/* Rank */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  rank === 0 ? 'rank-1' : rank === 1 ? 'rank-2' : rank === 2 ? 'rank-3' : 'bg-white/10 text-ivory/60'
                }`}
              >
                {rank + 1}
              </div>

              {/* Avatar */}
              <PlayerAvatar
                name={player.name}
                color={player.color}
                textColor={player.textColor}
                size="sm"
              />

              {/* Name + wins */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-ivory font-medium text-sm truncate">{player.name}</span>
                  {rank === 0 && <Crown size={12} className="text-amber-400 flex-shrink-0" />}
                </div>
                {wins[player.id] > 0 && (
                  <div className="text-xs text-ivory/40 mt-0.5">
                    🏆 {wins[player.id]} manche{wins[player.id] > 1 ? 's' : ''} gagnée{wins[player.id] > 1 ? 's' : ''}
                  </div>
                )}
              </div>

              {/* Score + delta */}
              <div className="text-right flex-shrink-0">
                <div
                  className={`font-bold text-base font-display ${
                    rank === 0 ? 'text-amber-400' : 'text-ivory'
                  }`}
                >
                  {total}
                  <span className="text-xs text-ivory/40 font-normal ml-1">pts</span>
                </div>
                {lastRoundDelta !== null && lastRoundDelta > 0 && (
                  <div className="text-xs text-red-400/80">
                    +{lastRoundDelta}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
