'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, Settings, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import PlayerAvatar from './PlayerAvatar'
import { useHistoryStore } from '@/store/historyStore'

export default function AppHeader() {
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const router = useRouter()
  const { matches } = useHistoryStore()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      const meta = user.user_metadata
      setUserName(meta?.full_name || meta?.name || '')
      setUserEmail(user.email ?? '')
    })
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const displayName = userName || userEmail.split('@')[0] || '?'

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-4 py-3"
      style={{
        background: 'rgba(10,14,26,0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(201,168,76,0.1)',
      }}
    >
      {/* Logo */}
      <span className="font-display text-gold font-bold text-lg tracking-widest">RAMI</span>

      {/* Right side */}
      <div className="flex items-center gap-3 relative">
        {/* Match count badge */}
        {matches.length > 0 && (
          <span className="text-xs text-ivory/40">
            {matches.length} partie{matches.length > 1 ? 's' : ''}
          </span>
        )}

        {/* User avatar + dropdown trigger */}
        <button
          onClick={() => setDropdownOpen(o => !o)}
          className="flex items-center gap-2 btn-ghost px-2.5 py-1.5"
        >
          <PlayerAvatar
            name={displayName}
            color="#C9A84C"
            textColor="#0A0E1A"
            size="sm"
          />
          <span className="text-ivory/70 text-sm max-w-[100px] truncate hidden sm:block">
            {displayName}
          </span>
          <Settings size={14} className="text-ivory/40 flex-shrink-0" />
        </button>

        {/* Dropdown */}
        <AnimatePresence>
          {dropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="absolute right-0 top-12 w-60 glass-card p-3 flex flex-col gap-1 z-50"
              style={{ border: '1px solid rgba(201,168,76,0.2)' }}
            >
              <div className="px-2 py-1.5 border-b border-white/5 mb-1">
                <p className="text-ivory/80 text-sm font-medium truncate">{displayName}</p>
                <p className="text-ivory/40 text-xs truncate">{userEmail}</p>
              </div>

              <button
                onClick={handleSignOut}
                className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-colors text-sm w-full text-left"
              >
                <LogOut size={15} />
                Déconnexion
              </button>

              <div className="mt-2 pt-2 border-t border-white/5 px-2">
                <p className="text-ivory/20 text-xs">Créé par</p>
                <p className="text-gold/60 text-xs font-medium">Ibrahim Stouri</p>
                <p className="text-ivory/20 text-[10px] truncate">ibrahimistouri@gmail.com</p>
              </div>

              <button
                onClick={() => setDropdownOpen(false)}
                className="absolute top-2.5 right-2.5 text-ivory/30 hover:text-ivory/60 transition-colors"
              >
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
