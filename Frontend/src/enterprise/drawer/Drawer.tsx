"use client"

import { useEffect, type ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface DrawerProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  side?: "left" | "right"
  width?: number
}

export function Drawer({ open, onClose, title, children, side = "right", width = 360 }: DrawerProps) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[900]">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0" style={{ backgroundColor: "rgba(0,0,0,0.3)" }} onClick={onClose} />
          <motion.div
            initial={{ x: side === "right" ? width : -width }}
            animate={{ x: 0 }} exit={{ x: side === "right" ? width : -width }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute top-0 bottom-0 flex flex-col border-l shadow-xl" style={{ [side]: 0, width, backgroundColor: "var(--surface-raised, #FFFFFF)", borderColor: "var(--border-default, #E5E5E5)" }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b shrink-0" style={{ borderColor: "var(--border-default, #E5E5E5)" }}>
              <span className="text-sm font-semibold" style={{ color: "var(--text-primary, #0A0A0A)" }}>{title}</span>
              <button onClick={onClose} aria-label="Close drawer" className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors" style={{ color: "var(--text-tertiary, #A3A3A3)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 text-sm" style={{ color: "var(--text-primary, #0A0A0A)" }}>{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
