'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Mail, Lock, User, Eye, EyeOff, CheckCircle2, Circle } from 'lucide-react'
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
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [magicSent, setMagicSent] = useState(false)
  const [forgotMode, setForgotMode] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [registrationSent, setRegistrationSent] = useState(false)

  const PWD_RULES = [
    { test: (p: string) => p.length >= 8,      label: '8 caractères minimum' },
    { test: (p: string) => /[A-Z]/.test(p),    label: 'Au moins une majuscule' },
    { test: (p: string) => /[0-9]/.test(p),    label: 'Au moins un chiffre' },
  ]
  const pwdStrong = PWD_RULES.every(r => r.test(password))
  const pwdMatch  = tab !== 'register' || confirmPassword === '' || password === confirmPassword

  const clearError = () => setError('')
  const switchTab = (t: Tab) => { setTab(t); clearError(); setConfirmPassword('') }

  const toFrench = (msg: string): string => {
    const m = msg.toLowerCase()
    if (m.includes('email not confirmed')) return 'Veuillez confirmer votre email avant de vous connecter.'
    if (m.includes('invalid login') || m.includes('invalid credentials') || m.includes('wrong password')) return 'Email ou mot de passe incorrect.'
    if (m.includes('user already registered') || m.includes('already been registered')) return 'Un compte existe déjà avec cet email.'
    if (m.includes('password should be') || m.includes('password must be')) return 'Le mot de passe doit contenir au moins 6 caractères.'
    if (m.includes('unable to validate') || m.includes('invalid email')) return 'Adresse email invalide.'
    if (m.includes('email rate limit') || m.includes('too many requests')) return 'Trop de tentatives. Réessayez dans quelques minutes.'
    if (m.includes('network') || m.includes('fetch')) return 'Erreur réseau. Vérifiez votre connexion.'
    return 'Une erreur est survenue. Réessayez.'
  }

  const handlePasswordAuth = async () => {
    setLoading(true)
    clearError()
    const supabase = createClient()
    if (tab === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(toFrench(error.message)); setLoading(false); return }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) { setError(toFrench(error.message)); setLoading(false); return }

      // Supabase quirk: duplicate email with confirmation enabled → empty identities, no error
      if (data.user?.identities?.length === 0) {
        setError('Un compte existe déjà avec cette adresse email.')
        setLoading(false)
        return
      }

      // Email confirmation required — no session yet
      if (!data.session) {
        setLoading(false)
        setRegistrationSent(true)
        return
      }
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
    if (error) { setError(toFrench(error.message)); setLoading(false); return }
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
    if (error) setError(toFrench(error.message))
  }

  const handleForgotPassword = async () => {
    if (!email.trim()) { setError('Saisissez votre adresse email.'); return }
    setLoading(true)
    clearError()
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    setLoading(false)
    if (error) { setError(toFrench(error.message)); return }
    setResetSent(true)
  }

  if (forgotMode) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative overflow-x-hidden" style={{ background: 'var(--bg-primary)' }}>
        <FloatingCardBackground />
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card p-6 max-w-sm w-full relative z-10"
        >
          {resetSent ? (
            <div className="text-center py-2">
              <div className="text-5xl mb-4">📬</div>
              <h2 className="font-display text-xl text-ivory font-bold mb-2">Lien envoyé !</h2>
              <p className="text-ivory/50 text-sm mb-6">
                Un lien de réinitialisation a été envoyé à{' '}
                <strong className="text-ivory/80">{email}</strong>
              </p>
              <button
                onClick={() => { setForgotMode(false); setResetSent(false) }}
                className="btn-ghost text-sm px-4 py-2"
              >
                ← Retour à la connexion
              </button>
            </div>
          ) : (
            <>
              <div className="mb-5">
                <h2 className="font-display text-xl text-ivory font-bold mb-1">Mot de passe oublié</h2>
                <p className="text-ivory/40 text-sm">
                  Entrez votre email pour recevoir un lien de réinitialisation.
                </p>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-red-400 text-sm mb-3"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative mb-3">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory/30" />
                <input
                  type="email"
                  placeholder="Votre adresse email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleForgotPassword()}
                  className="rami-input pl-9"
                  autoComplete="email"
                  autoFocus
                />
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleForgotPassword}
                disabled={loading}
                className="btn-gold w-full py-3 text-sm font-bold flex items-center justify-center gap-2 mb-3 disabled:opacity-60"
              >
                {loading
                  ? <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  : <><ArrowRight size={16} /> Envoyer le lien</>
                }
              </motion.button>

              <button
                onClick={() => { setForgotMode(false); clearError() }}
                className="text-xs text-ivory/30 hover:text-ivory/60 transition-colors w-full text-center"
              >
                ← Retour à la connexion
              </button>
            </>
          )}
        </motion.div>
      </div>
    )
  }

  if (magicSent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative overflow-x-hidden" style={{ background: 'var(--bg-primary)' }}>
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

  if (registrationSent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative overflow-x-hidden" style={{ background: 'var(--bg-primary)' }}>
        <FloatingCardBackground />
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card p-8 max-w-sm w-full text-center relative z-10"
        >
          <div className="text-5xl mb-4">✉️</div>
          <h2 className="font-display text-xl text-ivory font-bold mb-2">Confirmez votre email</h2>
          <p className="text-ivory/50 text-sm mb-1">
            Un lien de confirmation a été envoyé à
          </p>
          <p className="text-gold/80 text-sm font-semibold mb-6">{email}</p>
          <p className="text-ivory/30 text-xs mb-6">
            Cliquez sur le lien dans l&apos;email pour activer votre compte, puis revenez vous connecter.
          </p>
          <button
            onClick={() => { setRegistrationSent(false); setTab('login') }}
            className="btn-gold w-full py-3 text-sm font-bold"
          >
            Aller à la connexion →
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-6 pt-0 relative overflow-x-hidden" style={{ background: 'var(--bg-primary)' }}>
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
                onClick={() => switchTab(t)}
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

                  {/* Password strength (register only) */}
                  <AnimatePresence>
                    {tab === 'register' && password.length > 0 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-2.5 space-y-1.5 px-1"
                      >
                        {PWD_RULES.map(({ test, label }) => {
                          const ok = test(password)
                          return (
                            <div key={label} className="flex items-center gap-2 text-xs">
                              {ok
                                ? <CheckCircle2 size={12} className="text-green-400 flex-shrink-0" />
                                : <Circle size={12} className="text-ivory/20 flex-shrink-0" />
                              }
                              <span className={ok ? 'text-green-400' : 'text-ivory/30'}>{label}</span>
                            </div>
                          )
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Confirm password (register only) */}
                  <AnimatePresence>
                    {tab === 'register' && pwdStrong && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-3"
                      >
                        <div className="relative">
                          <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory/30" />
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Confirmer le mot de passe"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handlePasswordAuth()}
                            className={`rami-input pl-9 pr-10 ${
                              confirmPassword.length > 0 && !pwdMatch
                                ? 'border-red-500/60 focus:border-red-500'
                                : confirmPassword.length > 0 && pwdMatch
                                ? 'border-green-500/50'
                                : ''
                            }`}
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(s => !s)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-ivory/30 hover:text-ivory/60 transition-colors"
                          >
                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        {confirmPassword.length > 0 && !pwdMatch && (
                          <p className="text-red-400 text-xs mt-1.5 px-1">Les mots de passe ne correspondent pas.</p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Primary action */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={tab === 'login' && authMethod === 'magic' ? handleMagicLink : handlePasswordAuth}
              disabled={loading || (tab === 'register' && (!pwdStrong || !pwdMatch || confirmPassword === ''))}
              className="btn-gold w-full py-3.5 text-base font-bold flex items-center justify-center gap-2 mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
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
                onClick={() => { setForgotMode(true); clearError() }}
                className="text-xs text-ivory/30 hover:text-ivory/60 transition-colors w-full text-center"
              >
                Mot de passe oublié ?
              </button>
            )}
          </div>
        </motion.div>
      </div>

      {/* Footer attribution */}
      <div className="relative z-10 text-center pb-2">
        <p className="text-ivory/30 text-xs tracking-wide">
          Conçu &amp; développé par
        </p>
        <button
          onClick={() => window.open('https://www.ibrahimstouri.com/', '_blank', 'noopener,noreferrer')}
          className="text-gold/80 hover:text-gold active:text-gold transition-colors font-semibold text-sm mt-0.5 underline decoration-gold/40 underline-offset-2 px-2 py-1"
        >
          Ibrahim Stouri
        </button>
        <p className="text-ivory/20 text-[11px] mt-0.5 tracking-widest uppercase">
          © {new Date().getFullYear()} · Rami Score Tracker
        </p>
      </div>
    </div>
  )
}
