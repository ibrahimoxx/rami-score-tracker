'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import FloatingCardBackground from '@/components/FloatingCardBackground'

type Tab = 'login' | 'register'
type AuthMethod = 'password' | 'magic'

export default function LoginPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('login')
  const [authMethod, setAuthMethod] = useState<AuthMethod>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [magicSent, setMagicSent] = useState(false)

  const clearError = () => setError('')

  const handlePasswordAuth = async () => {
    setLoading(true)
    clearError()
    const supabase = createClient()
    if (tab === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      })
      if (error) { setError(error.message); setLoading(false); return }
    }
    router.push('/dashboard')
    router.refresh()
  }

  const handleMagicLink = async () => {
    setLoading(true)
    clearError()
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) { setError(error.message); setLoading(false); return }
    setMagicSent(true)
    setLoading(false)
  }

  const handleGoogle = async () => {
    clearError()
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) setError(error.message)
  }

  if (magicSent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
        <FloatingCardBackground />
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card p-8 max-w-sm w-full text-center relative z-10"
        >
          <div className="text-5xl mb-4">📬</div>
          <h2 className="font-display text-xl text-ivory font-bold mb-2">Vérifiez votre email</h2>
          <p className="text-ivory/50 text-sm mb-6">Un lien de connexion a été envoyé à <strong className="text-ivory/80">{email}</strong></p>
          <button onClick={() => setMagicSent(false)} className="btn-ghost text-sm px-4 py-2">
            ← Retour
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-6 pt-0 relative overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      <FloatingCardBackground />

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm relative z-10">
        {/* Logo */}
        <motion.div
          className="text-center mb-8"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <motion.div
            className="text-3xl mb-4 space-x-3"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <span style={{ color: '#C9A84C' }}>♠</span>
            <span style={{ color: '#C0392B' }}>♥</span>
            <span style={{ color: '#C9A84C' }}>♦</span>
            <span style={{ color: '#C0392B' }}>♣</span>
          </motion.div>
          <h1 className="font-display text-8xl font-bold gold-shimmer tracking-widest" style={{ letterSpacing: '0.15em' }}>
            RAMI
          </h1>
          <p className="text-ivory/40 text-sm mt-3 tracking-wider uppercase">Score Tracker</p>
        </motion.div>

        {/* Card */}
        <motion.div
          className="glass-card w-full overflow-hidden"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {/* Tab switcher */}
          <div className="flex border-b border-white/5">
            {(['login', 'register'] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); clearError() }}
                className={`flex-1 py-3.5 text-sm font-medium transition-colors ${
                  tab === t ? 'text-gold border-b-2 border-gold' : 'text-ivory/40 hover:text-ivory/60'
                }`}
              >
                {t === 'login' ? 'Connexion' : 'Inscription'}
              </button>
            ))}
          </div>

          <div className="p-5 space-y-3">
            {/* Error banner */}
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

            {/* Name field (register only) */}
            <AnimatePresence>
              {tab === 'register' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory/30" />
                    <input
                      type="text"
                      placeholder="Votre prénom"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="rami-input pl-9"
                      autoComplete="name"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory/30" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="rami-input pl-9"
                autoComplete="email"
              />
            </div>

            {/* Password / Magic link toggle (login only) */}
            {tab === 'login' && (
              <div className="flex gap-2">
                {(['password', 'magic'] as AuthMethod[]).map(m => (
                  <button
                    key={m}
                    onClick={() => setAuthMethod(m)}
                    className={`flex-1 py-1.5 text-xs rounded-lg transition-all border ${
                      authMethod === m
                        ? 'bg-gold/15 border-gold/40 text-gold'
                        : 'bg-white/3 border-white/10 text-ivory/40 hover:text-ivory/60'
                    }`}
                  >
                    {m === 'password' ? '🔑 Mot de passe' : '✉️ Lien magique'}
                  </button>
                ))}
              </div>
            )}

            {/* Password field */}
            <AnimatePresence>
              {(tab === 'register' || authMethod === 'password') && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory/30" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mot de passe"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handlePasswordAuth()}
                      className="rami-input pl-9 pr-10"
                      autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ivory/30 hover:text-ivory/60 transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Primary action */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={tab === 'login' && authMethod === 'magic' ? handleMagicLink : handlePasswordAuth}
              disabled={loading}
              className="btn-gold w-full py-3.5 text-base font-bold flex items-center justify-center gap-2 mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  {tab === 'login' && authMethod === 'magic'
                    ? 'Envoyer le lien'
                    : tab === 'login'
                    ? 'Se connecter'
                    : "S'inscrire"}
                  <ArrowRight size={18} />
                </>
              )}
            </motion.button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/8" />
              <span className="text-ivory/25 text-xs">ou</span>
              <div className="flex-1 h-px bg-white/8" />
            </div>

            {/* Google */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleGoogle}
              className="btn-ghost w-full py-3 flex items-center justify-center gap-2 text-sm font-medium"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuer avec Google
            </motion.button>

            {/* Forgot password */}
            {tab === 'login' && authMethod === 'password' && (
              <button
                onClick={() => { setAuthMethod('magic'); clearError() }}
                className="text-xs text-ivory/30 hover:text-ivory/60 transition-colors w-full text-center"
              >
                Mot de passe oublié ? → Utiliser un lien magique
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
