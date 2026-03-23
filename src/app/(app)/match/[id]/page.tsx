'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import MatchDetailScreen from '@/screens/MatchDetailScreen'
import { getMatchDetail } from '@/lib/db'
import type { SavedMatch } from '@/store/historyStore'

export default function MatchDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [match, setMatch] = useState<SavedMatch | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const id = params.id as string
    if (!id) return
    getMatchDetail(id)
      .then(data => {
        if (!data) setNotFound(true)
        else setMatch(data)
        setLoading(false)
      })
      .catch(() => { setNotFound(true); setLoading(false) })
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    )
  }

  if (notFound || !match) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-5xl">🃏</p>
        <p className="text-ivory/60 text-center">Partie introuvable</p>
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => router.push('/dashboard')} className="btn-gold px-5 py-2.5 text-sm font-semibold">
          ← Retour au tableau de bord
        </motion.button>
      </div>
    )
  }

  return <MatchDetailScreen match={match} onBack={() => router.push('/dashboard')} />
}
