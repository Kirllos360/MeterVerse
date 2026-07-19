"use client"

import { useEffect, useRef, type ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  size?: "sm" | "md" | "lg" | "xl"
}

const sizeMap = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg", xl: "max-w-xl" }

export function Dialog({ open, onClose, title, children, footer, size = "md" }: DialogProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open, onClose])

  useEffect(() => {
    if (open) ref.current?.focus()
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
            className="absolute inset-0" style={{ backgroundColor: "rgba(var(--black-rgb), 0.4)" }} onClick={onClose} />
          <motion.div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title}
            initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`relative w-full ${sizeMap[size]} rounded-xl border shadow-2xl overflow-hidden`}
            style={{ backgroundColor: "var(--surface-raised)", borderColor: "var(--border-default)" }}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: "var(--border-default)" }}>
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{title}</h2>
              <button onClick={onClose} aria-label="Close" className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors" style={{ color: "var(--text-tertiary)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="px-5 py-4 text-sm" style={{ color: "var(--text-primary)" }}>{children}</div>
            {footer && <div className="flex items-center justify-end gap-2 px-5 py-3 border-t" style={{ borderColor: "var(--border-default)" }}>{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export function DialogFooter({ children }: { children: ReactNode }) {
  return <>{children}</>
}
