'use client'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'
import PlayerSetupScreen from '@/screens/PlayerSetupScreen'
import { useGameStore } from '@/store/gameStore'

function SetupContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const matchName = searchParams.get('match') || 'Nouvelle partie'
  const { startGame, isLoading } = useGameStore()

  const handleStart = async (players: { name: string; color: string; textColor: string; position: number }[], penaltyRules: number[]) => {
    await startGame(matchName, players, penaltyRules)
    router.push('/game')
  }

  return (
    <PlayerSetupScreen
      onBack={() => router.push('/game')}
      onStart={handleStart}
      isLoading={isLoading}
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
