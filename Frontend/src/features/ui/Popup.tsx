"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect } from "react"

interface PopupProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

export function Popup({ open, onClose, title, children }: PopupProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
            style={{ backgroundColor: "var(--surface-raised)", border: "1px solid var(--border-default)" }}
          >
            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border-default)" }}>
                <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{title}</h2>
              </div>
            )}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-all active:scale-90"
              style={{ color: "var(--text-tertiary)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
            <div className="p-6" style={{ color: "var(--text-primary)" }}>{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
