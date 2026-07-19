"use client"

import { useState, useRef, useEffect, type ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface ContextMenuItem {
  id: string
  label: string
  icon?: string
  danger?: boolean
  disabled?: boolean
  shortcut?: string
  onClick: () => void
}

interface ContextMenuProps {
  items: ContextMenuItem[]
  children: ReactNode
}

export function ContextMenu({ items, children }: ContextMenuProps) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const keyHandler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false) }
    document.addEventListener("mousedown", handler)
    document.addEventListener("keydown", keyHandler)
    return () => { document.removeEventListener("mousedown", handler); document.removeEventListener("keydown", keyHandler) }
  }, [open])

  return (
    <div ref={ref} onContextMenu={(e) => { e.preventDefault(); setPos({ x: e.clientX, y: e.clientY }); setOpen(true) }} className="contents">
      {children}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.1 }}
            className="fixed z-[1200] w-48 rounded-xl border shadow-xl overflow-hidden py-1"
            style={{ left: pos.x, top: pos.y, backgroundColor: "var(--surface-raised, #FFFFFF)", borderColor: "var(--border-default, #E5E5E5)" }}
          >
            {items.map((item) => (
              <button key={item.id} disabled={item.disabled}
                onClick={() => { item.onClick(); setOpen(false) }}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-left transition-colors"
                style={{ color: item.danger ? "var(--status-error)" : "var(--text-primary, #0A0A0A)", opacity: item.disabled ? 0.4 : 1 }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(0,0,0,0.03)" }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d={item.icon || ""} /></svg>
                <span className="flex-1">{item.label}</span>
                {item.shortcut && <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{item.shortcut}</span>}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
