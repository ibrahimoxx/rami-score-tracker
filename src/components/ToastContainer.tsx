'use client'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useToastStore } from '../store/toastStore'

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ x: 120, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 120, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="pointer-events-auto glass-card px-4 py-3 flex items-center gap-3 min-w-[220px] max-w-[300px]"
            style={{ borderColor: t.type === 'warning' ? 'rgba(192,57,43,0.4)' : 'rgba(201,168,76,0.25)' }}
          >
            <span className="text-lg flex-shrink-0">
              {t.type === 'warning' ? '⚠️' : t.type === 'success' ? '🏆' : 'ℹ️'}
            </span>
            <span className="text-ivory/90 text-sm flex-1">{t.message}</span>
            <button
              className="text-ivory/40 hover:text-ivory/80 transition-colors flex-shrink-0"
              onClick={() => removeToast(t.id)}
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
