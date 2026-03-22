import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  danger?: boolean
}

export default function ConfirmDialog({
  open, title, message, confirmLabel = 'Confirmer', cancelLabel = 'Annuler',
  onConfirm, onCancel, danger = false,
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
          <motion.div
            className="glass-card relative z-10 w-full max-w-sm p-6 text-center"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div className="text-3xl mb-3">⚠️</div>
            <h3 className="font-display text-lg font-bold text-ivory mb-2">{title}</h3>
            <p className="text-ivory/70 text-sm mb-5">{message}</p>
            <div className="flex gap-3">
              <button className="btn-ghost flex-1 py-3 font-medium" onClick={onCancel}>
                {cancelLabel}
              </button>
              <button
                className={`flex-1 py-3 font-semibold rounded-xl transition-all ${
                  danger
                    ? 'bg-red-card hover:bg-red-700 text-white'
                    : 'btn-gold'
                }`}
                onClick={onConfirm}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
