'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import GameScreen from '@/screens/GameScreen'
import WelcomeScreen from '@/screens/WelcomeScreen'
import PodiumScreen from '@/components/PodiumScreen'
import { useGameStore, type ActiveGame } from '@/store/gameStore'
import { useHistoryStore } from '@/store/historyStore'

const pageVariants = {
  initial: { x: '100%', opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: '-100%', opacity: 0 },
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pageTransition: any = { type: 'tween', duration: 0.25, ease: [0.4, 0, 0.2, 1] }

type View = 'welcome' | 'game' | 'podium'

export default function GamePage() {
  const router = useRouter()
  const { activeGame, loadActiveGame, endGame, clearGame, isLoading } = useGameStore()
  const { loadMatches } = useHistoryStore()

  const [view, setView] = useState<View>('welcome')
  const [finishedGame, setFinishedGame] = useState<ActiveGame | null>(null)

  useEffect(() => {
    loadActiveGame()
  }, [loadActiveGame])

  // Transition to game view only when activeGame loads while we're on welcome
  useEffect(() => {
    if (activeGame && view === 'welcome') setView('game')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeGame])

  const handleStart = (matchName: string) => {
    router.push(`/game/setup?match=${encodeURIComponent(matchName)}`)
  }

  const handleEndGame = async () => {
    const finished = await endGame()
    if (finished) {
      setFinishedGame(finished)
      setView('podium')
    }
  }

  const handleSaveAndHistory = async () => {
    await loadMatches()
    setFinishedGame(null)
    router.push('/dashboard')
  }

  const handleNewGame = () => {
    clearGame()
    setFinishedGame(null)
    setView('welcome')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden min-h-screen">
      <AnimatePresence mode="wait">
        {view === 'welcome' && (
          <motion.div
            key="welcome"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className="absolute inset-0 overflow-y-auto"
          >
            <WelcomeScreen
              onStart={handleStart}
              onHistory={() => router.push('/dashboard')}
              hasActiveGame={false}
              onResume={() => setView('game')}
            />
          </motion.div>
        )}

        {view === 'game' && activeGame && (
          <motion.div
            key="game"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className="absolute inset-0 overflow-y-auto"
          >
            <GameScreen onEndGame={handleEndGame} />
          </motion.div>
        )}

        {view === 'podium' && finishedGame && (
          <motion.div
            key="podium"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className="absolute inset-0 overflow-y-auto"
          >
            <PodiumScreen
              game={finishedGame}
              onNewGame={handleNewGame}
              onSaveAndHistory={handleSaveAndHistory}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
