'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, User, X } from 'lucide-react'
import { getPlayerColor, PENALTY_COLORS } from '../utils/colors'

interface Props {
  onBack: () => void
  onStart: (players: { name: string; color: string; textColor: string; position: number }[], penaltyRules: number[]) => void
  isLoading?: boolean
}

const COUNTS = [2, 3, 4, 5, 6]

export default function PlayerSetupScreen({ onBack, onStart, isLoading = false }: Props) {
  const [count, setCount] = useState(4)
  const [names, setNames] = useState<string[]>(Array(6).fill(''))
  const [penaltyInput, setPenaltyInput] = useState('')
  const [penaltyRules, setPenaltyRules] = useState<number[]>([])

  const addPenaltyRule = () => {
    const val = parseInt(penaltyInput)
    if (!isNaN(val) && val > 0) {
      setPenaltyRules(r => [...r, val])
      setPenaltyInput('')
    }
  }

  const removePenaltyRule = (idx: number) => {
    setPenaltyRules(r => r.filter((_, i) => i !== idx))
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setNames(prev => {
      const next = [...prev]
      while (next.length < 6) next.push('')
      return next
    })
  // eslint-disable-next-line react-hooks/set-state-in-effect
  }, [count])

  const handleStart = () => {
    const players = Array.from({ length: count }, (_, i) => {
      const color = getPlayerColor(i)
      return {
        name: names[i]?.trim() || `Joueur ${i + 1}`,
        color: color.bg,
        textColor: color.text,
        position: i,
      }
    })
    onStart(players, penaltyRules)
  }

  return (
    <div className="min-h-screen flex flex-col p-6">
      {/* Header */}
      <motion.div
        className="flex items-center gap-3 mb-8 pt-2"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
      >
        <button onClick={onBack} className="btn-ghost p-2.5">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="font-display text-xl font-bold text-ivory">Configuration</h1>
          <p className="text-ivory/40 text-xs">Préparez la partie</p>
        </div>
      </motion.div>

      <div className="flex-1 flex flex-col max-w-sm mx-auto w-full">
        {/* Player count selector */}
        <motion.div
          className="glass-card p-5 mb-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-ivory/60 text-sm mb-4 text-center">Combien de joueurs ?</h2>
          <div className="flex gap-2 justify-center">
            {COUNTS.map(n => (
              <motion.button
                key={n}
                whileTap={{ scale: 0.9 }}
                onClick={() => setCount(n)}
                className={`w-11 h-11 rounded-xl font-bold text-lg transition-all ${
                  count === n
                    ? 'btn-gold'
                    : 'btn-ghost text-ivory/60'
                }`}
              >
                {n}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Name inputs */}
        <motion.div
          className="glass-card p-5 overflow-y-auto"
          style={{ maxHeight: '40vh' }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-ivory/60 text-sm mb-4">Noms des joueurs</h2>
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {Array.from({ length: count }, (_, i) => {
                const color = getPlayerColor(i)
                return (
                  <motion.div
                    key={i}
                    initial={{ x: -20, opacity: 0, height: 0 }}
                    animate={{ x: 0, opacity: 1, height: 'auto' }}
                    exit={{ x: 20, opacity: 0, height: 0 }}
                    transition={{ delay: i * 0.04, type: 'spring', stiffness: 300, damping: 25 }}
                    className="flex items-center gap-3"
                  >
                    {/* Color avatar */}
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm"
                      style={{ background: color.bg, color: color.text }}
                    >
                      {names[i]?.trim() ? names[i].trim()[0].toUpperCase() : <User size={16} />}
                    </div>
                    <input
                      type="text"
                      value={names[i] ?? ''}
                      onChange={e => {
                        const next = [...names]
                        next[i] = e.target.value
                        setNames(next)
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && i < count - 1) {
                          const next = document.querySelectorAll<HTMLInputElement>('.player-name-input')
                          next[i + 1]?.focus()
                        }
                      }}
                      placeholder={`Joueur ${i + 1}`}
                      className="rami-input player-name-input py-2.5 flex-1"
                      autoComplete="off"
                    />
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Penalty rules config */}
        <motion.div
          className="glass-card p-5 mt-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-ivory/60 text-sm mb-3">
            Pénalités <span className="text-ivory/30 text-xs">(optionnel)</span>
          </h2>
          <div className="flex gap-2 mb-3">
            <input
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Valeur (ex: 11)"
              value={penaltyInput}
              onChange={e => setPenaltyInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addPenaltyRule()}
              className="rami-input py-2.5 flex-1 text-center"
            />
            <button
              onClick={addPenaltyRule}
              disabled={!penaltyInput.trim() || isNaN(parseInt(penaltyInput)) || parseInt(penaltyInput) <= 0}
              className="btn-gold px-4 text-sm font-bold disabled:opacity-40"
            >
              + Ajouter
            </button>
          </div>
          {penaltyRules.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {penaltyRules.map((v, i) => {
                  const col = PENALTY_COLORS[i % PENALTY_COLORS.length]
                  return (
                    <motion.button
                      key={i}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                      onClick={() => removePenaltyRule(i)}
                      className="flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-full text-white"
                      style={{ background: col.bg, border: `1px solid ${col.border}` }}
                      title="Appuyer pour supprimer"
                    >
                      +{v} <X size={11} strokeWidth={3} className="opacity-80" />
                    </motion.button>
                  )
                })}
              </AnimatePresence>
            </div>
          ) : (
            <p className="text-ivory/25 text-xs text-center py-1">
              Aucune pénalité — la partie n&apos;aura pas de boutons de pénalité
            </p>
          )}
        </motion.div>

        {/* Start button */}
        <motion.button
          whileTap={{ scale: isLoading ? 1 : 0.97 }}
          onClick={handleStart}
          disabled={isLoading}
          className="btn-gold w-full py-4 text-base font-bold flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {isLoading ? (
            <>
              <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              Création de la partie…
            </>
          ) : (
            <>Lancer la partie <ArrowRight size={18} /></>
          )}
        </motion.button>
      </div>
    </div>
  )
}

