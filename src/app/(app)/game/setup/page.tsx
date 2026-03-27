'use client'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'
import PlayerSetupScreen from '@/screens/PlayerSetupScreen'
import { useGameStore } from '@/store/gameStore'

function SetupContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const matchName = searchParams.get('match') || 'Nouvelle partie'
  const { startGame, isLoading, syncError } = useGameStore()

  const handleStart = async (players: { name: string; color: string; textColor: string; position: number }[], penaltyRules: number[]) => {
    await startGame(matchName, players, penaltyRules)
    if (useGameStore.getState().activeGame) {
      router.push('/game')
    }
    // If activeGame is still null, syncError is set — shown below
  }

  return (
    <>
      {syncError && (
        <div className="fixed top-4 left-4 right-4 z-50 bg-red-900/80 border border-red-500/40 text-red-200 text-sm rounded-xl px-4 py-3 text-center">
          Erreur : {syncError}
        </div>
      )}
      <PlayerSetupScreen
        onBack={() => router.push('/dashboard')}
        onStart={handleStart}
        isLoading={isLoading}
      />
    </>
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
