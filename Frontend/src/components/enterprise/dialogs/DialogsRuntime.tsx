"use client"

import { type ReactNode, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { variants, transitions } from "@/design-system/motion"

interface DialogProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  footer?: ReactNode
  width?: "sm" | "md" | "lg" | "xl" | "full"
}

const sizes = { sm: 400, md: 520, lg: 640, xl: 800, full: "90vw" as const }

export function Dialog({ open, onClose, title, children, footer, width = "md" }: DialogProps) {
  useEffect(() => {
    if (open) {
      const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
      window.addEventListener("keydown", handler)
      return () => window.removeEventListener("keydown", handler)
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div variants={variants.fadeIn} initial="initial" animate="animate" exit="exit"
            className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div variants={variants.scaleIn} initial="initial" animate="animate" exit="exit"
            className="relative rounded-xl shadow-2xl border max-h-[85vh] flex flex-col"
            style={{ width: sizes[width], backgroundColor: "var(--surface-dialog, #FFFFFF)", borderColor: "var(--border-default, #E5E5E5)" }}
          >
            {title && (
              <div className="flex items-center justify-between px-5 py-3.5 border-b shrink-0" style={{ borderColor: "var(--border-default, #E5E5E5)" }}>
                <h2 className="text-base font-semibold" style={{ color: "var(--text-primary, #0A0A0A)" }}>{title}</h2>
                <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-black/5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            )}
            <div className="flex-1 overflow-y-auto p-5">{children}</div>
            {footer && <div className="flex items-center justify-end gap-2 px-5 py-3 border-t shrink-0" style={{ borderColor: "var(--border-default, #E5E5E5)" }}>{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
