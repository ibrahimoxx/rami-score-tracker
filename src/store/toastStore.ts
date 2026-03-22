import { create } from 'zustand'

export interface Toast {
  id: string
  message: string
  type?: 'info' | 'warning' | 'success'
}

interface ToastState {
  toasts: Toast[]
  addToast: (message: string, type?: Toast['type']) => void
  removeToast: (id: string) => void
}

function uid() {
  return Math.random().toString(36).slice(2)
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (message, type = 'info') => {
    const id = uid()
    set(s => ({ toasts: [...s.toasts, { id, message, type }] }))
    setTimeout(() => {
      set(s => ({ toasts: s.toasts.filter(t => t.id !== id) }))
    }, 3500)
  },
  removeToast: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
}))
