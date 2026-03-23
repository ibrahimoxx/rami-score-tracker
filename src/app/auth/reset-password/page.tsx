'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import FloatingCardBackground from '@/components/FloatingCardBackground'

type Step = 'form' | 'success' | 'invalid'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<Step>('form')

  // Supabase puts the recovery token in the URL hash — exchange it for a session
  useEffect(() => {
    const supabase = createClient()
    // Listen for the PASSWORD_RECOVERY event which fires after Supabase
    // detects the #access_token in the URL and sets up the session
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        // Session is set — user can now call updateUser
        setStep('form')
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleReset = async () => {
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (error) {
      if (error.message.toLowerCase().includes('expired') || error.message.toLowerCase().includes('invalid')) {
        setStep('invalid')
      } else {
        setError('Une erreur est survenue. Réessayez.')
      }
      return
    }

    setStep('success')
    setTimeout(() => router.push('/dashboard'), 2500)
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{ background: 'var(--bg-primary)' }}
    >
      <FloatingCardBackground />

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-2xl mb-3 space-x-2">
            <span style={{ color: '#C9A84C' }}>♠</span>
            <span style={{ color: '#C0392B' }}>♥</span>
            <span style={{ color: '#C9A84C' }}>♦</span>
            <span style={{ color: '#C0392B' }}>♣</span>
          </div>
          <h1
            className="font-display text-5xl font-bold gold-shimmer tracking-widest"
            style={{ letterSpacing: '0.15em' }}
          >
            RAMI
          </h1>
        </div>

        <div className="glass-card p-6">
          {/* ── Success ── */}
          {step === 'success' && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-2"
            >
              <div className="text-5xl mb-4">✅</div>
              <h2 className="font-display text-xl text-ivory font-bold mb-2">
                Mot de passe mis à jour !
              </h2>
              <p className="text-ivory/40 text-sm">Redirection vers le tableau de bord…</p>
            </motion.div>
          )}

          {/* ── Invalid / expired link ── */}
          {step === 'invalid' && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-2"
            >
              <div className="text-5xl mb-4">⚠️</div>
              <h2 className="font-display text-xl text-ivory font-bold mb-2">Lien expiré</h2>
              <p className="text-ivory/50 text-sm mb-6">
                Ce lien de réinitialisation est invalide ou a expiré.
              </p>
              <button
                onClick={() => router.push('/login')}
                className="btn-gold px-5 py-2.5 text-sm font-semibold"
              >
                Demander un nouveau lien
              </button>
            </motion.div>
          )}

          {/* ── Form ── */}
          {step === 'form' && (
            <>
              <div className="mb-5">
                <h2 className="font-display text-xl text-ivory font-bold mb-1">
                  Nouveau mot de passe
                </h2>
                <p className="text-ivory/40 text-sm">Choisissez un mot de passe sécurisé.</p>
              </div>

              <div className="space-y-3">
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-red-400 text-sm"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* New password */}
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory/30" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Nouveau mot de passe"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="rami-input pl-9 pr-10"
                    autoComplete="new-password"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ivory/30 hover:text-ivory/60 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Confirm password */}
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory/30" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirmer le mot de passe"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleReset()}
                    className="rami-input pl-9"
                    autoComplete="new-password"
                  />
                </div>

                {/* Password strength hint */}
                {password.length > 0 && (
                  <p className={`text-xs ${password.length >= 6 ? 'text-green-400/70' : 'text-red-400/70'}`}>
                    {password.length >= 6 ? '✓ Longueur suffisante' : `${6 - password.length} caractère(s) minimum requis`}
                  </p>
                )}

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleReset}
                  disabled={loading}
                  className="btn-gold w-full py-3.5 text-base font-bold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading
                    ? <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    : <><ArrowRight size={18} /> Enregistrer</>
                  }
                </motion.button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
