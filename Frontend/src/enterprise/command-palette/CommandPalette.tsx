"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface CommandItem {
  id: string
  label: string
  labelAr?: string
  icon?: string
  shortcut?: string
  group?: string
  keywords?: string[]
  onExecute: () => void
}

interface CommandPaletteProps {
  commands: CommandItem[]
}

export function CommandPalette({ commands }: CommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setIsOpen((p) => !p) }
      if (e.key === "Escape" && isOpen) setIsOpen(false)
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [isOpen])

  useEffect(() => {
    if (isOpen) { setQuery(""); setSelectedIndex(0); setTimeout(() => inputRef.current?.focus(), 50) }
  }, [isOpen])

  const filtered = query
    ? commands.filter((c) => {
        const q = query.toLowerCase()
        return c.label.toLowerCase().includes(q) || c.keywords?.some((k) => k.includes(q)) || c.group?.toLowerCase().includes(q)
      })
    : commands

  const grouped = filtered.reduce<Record<string, CommandItem[]>>((acc, cmd) => {
    const group = cmd.group || "Other"
    if (!acc[group]) acc[group] = []
    acc[group].push(cmd)
    return acc
  }, {})

  const flatFiltered = filtered
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIndex((i) => Math.min(i + 1, flatFiltered.length - 1)) }
    if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIndex((i) => Math.max(i - 1, 0)) }
    if (e.key === "Enter" && flatFiltered[selectedIndex]) { flatFiltered[selectedIndex].onExecute(); setIsOpen(false) }
  }, [flatFiltered, selectedIndex])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1100] flex items-start justify-center pt-[15vh]">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0" style={{ backgroundColor: "rgba(0,0,0,0.4)" }} onClick={() => setIsOpen(false)} />
          <motion.div initial={{ opacity: 0, y: -20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative w-full max-w-lg rounded-xl border shadow-2xl overflow-hidden"
            style={{ backgroundColor: "var(--surface-raised, #FFFFFF)", borderColor: "var(--border-default, #E5E5E5)" }}
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: "var(--border-default, #E5E5E5)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input ref={inputRef} value={query} onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0) }} onKeyDown={handleKeyDown}
                placeholder="Search commands..."
                className="flex-1 text-sm outline-none bg-transparent" style={{ color: "var(--text-primary, #0A0A0A)" }}
                aria-label="Search commands" role="combobox" aria-expanded="true" aria-controls="command-list"
              />
              <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: "var(--surface-sunken, #F0F0F0)", color: "var(--text-tertiary, #A3A3A3)" }}>ESC</span>
            </div>
            <div id="command-list" className="max-h-72 overflow-y-auto p-2" role="listbox">
              {Object.entries(grouped).length === 0 ? (
                <div className="p-4 text-center text-xs" style={{ color: "var(--text-tertiary, #A3A3A3)" }}>No results found</div>
              ) : Object.entries(grouped).map(([group, items]) => (
                <div key={group}>
                  <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary, #A3A3A3)" }}>{group}</div>
                  {items.map((cmd, idx) => {
                    const globalIdx = flatFiltered.indexOf(cmd)
                    return (
                      <button key={cmd.id} role="option" aria-selected={selectedIndex === globalIdx}
                        onClick={() => { cmd.onExecute(); setIsOpen(false) }}
                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                        className={`flex items-center gap-3 w-full px-2 py-2 rounded-lg text-xs text-left transition-colors`}
                        style={{
                          backgroundColor: selectedIndex === globalIdx ? "rgba(0,191,165,0.1)" : "transparent",
                          color: "var(--text-primary, #0A0A0A)",
                        }}
                      >
                        {cmd.icon && <span className="text-sm">{cmd.icon}</span>}
                        <span className="flex-1">{cmd.label}</span>
                        {cmd.shortcut && <span className="text-[10px]" style={{ color: "var(--text-tertiary, #A3A3A3)" }}>{cmd.shortcut}</span>}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
