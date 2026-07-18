"use client"

import { useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { create } from "zustand"
import { useTranslation } from "@/hooks/use-translation"

type ToastType = "success" | "error" | "warning" | "info"

interface Toast {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: number
}

interface ToastStore {
  toasts: Toast[]
  add: (toast: Omit<Toast, "id">) => void
  remove: (id: string) => void
}

const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],
  add: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }))
    const dur = toast.duration ?? 4000
    if (dur > 0) {
      setTimeout(() => {
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
      }, dur)
    }
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

const typeStyles: Record<ToastType, { bg: string; border: string; icon: string }> = {
  success: { bg: "rgba(0,191,165,0.1)", border: "rgba(0,191,165,0.3)", icon: "#00BFA5" },
  error: { bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)", icon: "#EF4444" },
  warning: { bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)", icon: "#F59E0B" },
  info: { bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.3)", icon: "#3B82F6" },
}

const typeIcons: Record<ToastType, string> = {
  success: "M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3",
  error: "M18 6L6 18M6 6l12 12",
  warning: "M12 9v4m0 4h.01M10.29 3.86l-8.1 14c-.6 1.04.15 2.14 1.2 2.14h17.22c1.05 0 1.8-1.1 1.2-2.14l-8.1-14c-.6-1.04-2.07-1.04-2.67 0z",
  info: "M12 16v-4m0-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z",
}

function ToastIcon({ type }: { type: ToastType }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={typeIcons[type] ? typeStyles[type].icon : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={typeIcons[type]} />
    </svg>
  )
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const style = typeStyles[toast.type]
  const { t } = useTranslation()

  return (
    <motion.div
      initial={{ opacity: 0, x: 80, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="flex items-start gap-3 w-80 rounded-xl border p-3 shadow-xl backdrop-blur-md"
      style={{
        backgroundColor: style.bg,
        borderColor: style.border,
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="shrink-0 mt-0.5">
        <ToastIcon type={toast.type} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold" style={{ color: "var(--text-primary, #0A0A0A)" }}>{toast.title}</p>
        {toast.description && (
          <p className="text-[11px] mt-0.5" style={{ color: "var(--text-secondary, #737373)" }}>{toast.description}</p>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="shrink-0 w-5 h-5 flex items-center justify-center rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        aria-label={t("toast.dismiss", "Dismiss")}
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </motion.div>
  )
}

export function ToastContainer() {
  const { toasts, remove } = useToastStore()

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2" style={{ direction: "ltr" }}>
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => remove(t.id)} />
        ))}
      </AnimatePresence>
    </div>
  )
}

export function useToast() {
  const add = useToastStore((s) => s.add)
  return {
    success: useCallback((title: string, desc?: string) => add({ type: "success", title, description: desc }), [add]),
    error: useCallback((title: string, desc?: string) => add({ type: "error", title, description: desc }), [add]),
    warning: useCallback((title: string, desc?: string) => add({ type: "warning", title, description: desc }), [add]),
    info: useCallback((title: string, desc?: string) => add({ type: "info", title, description: desc }), [add]),
  }
}
