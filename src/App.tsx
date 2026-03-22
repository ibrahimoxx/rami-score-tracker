import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import WelcomeScreen from './screens/WelcomeScreen'
import PlayerSetupScreen from './screens/PlayerSetupScreen'
import GameScreen from './screens/GameScreen'
import HistoryScreen from './screens/HistoryScreen'
import MatchDetailScreen from './screens/MatchDetailScreen'
import PodiumScreen from './components/PodiumScreen'
import ToastContainer from './components/ToastContainer'
import { useGameStore, type ActiveGame } from './store/gameStore'
import { useHistoryStore, type SavedMatch } from './store/historyStore'

type Screen = 'welcome' | 'setup' | 'game' | 'history' | 'matchDetail' | 'podium'

const pageVariants = {
  initial: { x: '100%', opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: '-100%', opacity: 0 },
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pageTransition: any = { type: 'tween', duration: 0.25, ease: [0.4, 0, 0.2, 1] }

export default function App() {
  const [screen, setScreen] = useState<Screen>('welcome')
  const [matchName, setMatchName] = useState('')
  const [selectedMatch, setSelectedMatch] = useState<SavedMatch | null>(null)
  const [finishedGame, setFinishedGame] = useState<ActiveGame | null>(null)

  const { activeGame, startGame, endGame } = useGameStore()
  const { saveMatch } = useHistoryStore()

  const go = (s: Screen) => setScreen(s)

  const handleStart = (name: string) => {
    setMatchName(name)
    go('setup')
  }

  const handleStartGame = (players: { name: string; color: string; textColor: string; position: number }[]) => {
    startGame(matchName, players)
    go('game')
  }

  const handleEndGame = () => {
    const finished = endGame()
    if (finished) {
      setFinishedGame(finished)
      go('podium')
    }
  }

  const handleSaveAndHistory = () => {
    if (finishedGame) {
      saveMatch(finishedGame as SavedMatch)
    }
    setFinishedGame(null)
    go('history')
  }

  const handleNewGame = () => {
    setFinishedGame(null)
    go('welcome')
  }

  const handleViewMatch = (match: SavedMatch) => {
    setSelectedMatch(match)
    go('matchDetail')
  }

  return (
    <div className="relative overflow-hidden min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <ToastContainer />

      <AnimatePresence mode="wait">
        {screen === 'welcome' && (
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
              onHistory={() => go('history')}
              hasActiveGame={!!activeGame}
              onResume={() => go('game')}
            />
          </motion.div>
        )}

        {screen === 'setup' && (
          <motion.div
            key="setup"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className="absolute inset-0 overflow-y-auto"
          >
            <PlayerSetupScreen
              onBack={() => go('welcome')}
              onStart={handleStartGame}
            />
          </motion.div>
        )}

        {screen === 'game' && (
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

        {screen === 'podium' && finishedGame && (
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

        {screen === 'history' && (
          <motion.div
            key="history"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className="absolute inset-0 overflow-y-auto"
          >
            <HistoryScreen
              onBack={() => go('welcome')}
              onViewMatch={handleViewMatch}
            />
          </motion.div>
        )}

        {screen === 'matchDetail' && selectedMatch && (
          <motion.div
            key="matchDetail"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className="absolute inset-0 overflow-y-auto"
          >
            <MatchDetailScreen
              match={selectedMatch}
              onBack={() => go('history')}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
