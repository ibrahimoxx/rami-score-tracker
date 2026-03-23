'use client'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'
import { motion } from 'framer-motion'
import PlayerSetupScreen from '@/screens/PlayerSetupScreen'
import { useGameStore } from '@/store/gameStore'

function SetupContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const matchName = searchParams.get('match') || 'Nouvelle partie'
  const { startGame, isLoading } = useGameStore()

  const handleStart = async (players: { name: string; color: string; textColor: string; position: number }[]) => {
    await startGame(matchName, players)
    router.push('/game')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-ivory/40 text-sm"
        >
          Création de la partie…
        </motion.p>
      </div>
    )
  }

  return (
    <PlayerSetupScreen
      onBack={() => router.push('/game')}
      onStart={handleStart}
    />
  )
}

export default function SetupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    }>
      <SetupContent />
    </Suspense>
  )
}
