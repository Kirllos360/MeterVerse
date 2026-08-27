"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAdminStore } from "@/stores/admin-store"

interface Command {
  id: string
  label: string
  icon: string
  action: () => void
  keywords: string[]
}

const ALL_COMMANDS: Command[] = [
  { id: "home", label: "Go to Home", icon: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z", action: () => {}, keywords: ["home", "dashboard", "start"] },
  { id: "monitoring", label: "Open Monitoring", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2", action: () => {}, keywords: ["monitor", "health", "status"] },
  { id: "connection", label: "Open Connection", icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9", action: () => {}, keywords: ["connect", "network", "settings"] },
  { id: "customers", label: "Open Customer Settings", icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2", action: () => {}, keywords: ["customer", "client", "person"] },
  { id: "meters", label: "Open Meter Settings", icon: "M9 3l3-3m0 0l3 3m-3-3v12", action: () => {}, keywords: ["meter", "device", "reading"] },
  { id: "invoices", label: "Open Invoices", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586", action: () => {}, keywords: ["invoice", "bill", "payment"] },
  { id: "readings", label: "Open Readings", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10", action: () => {}, keywords: ["reading", "meter", "consumption"] },
  { id: "settings", label: "Open General Settings", icon: "M12 15a3 3 0 100-6 3 3 0 000 6z", action: () => {}, keywords: ["settings", "config", "preferences"] },
  { id: "audit", label: "Open Audit Log", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2", action: () => {}, keywords: ["audit", "log", "history", "activity"] },
  { id: "reports", label: "Open Reports", icon: "M9 17v-2m3 2v-4m3 4v-6", action: () => {}, keywords: ["report", "export", "analytics"] },
  { id: "toggle-theme", label: "Toggle Theme", icon: "M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z", action: () => {}, keywords: ["theme", "dark", "light", "mode"] },
  { id: "toggle-sidebar", label: "Toggle Sidebar", icon: "M4 6h16M4 12h16M4 18h16", action: () => {}, keywords: ["sidebar", "collapse", "nav"] },
]

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [selectedIdx, setSelectedIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const { setActivePage, cycleTheme, setSidebarCollapsed, sidebarCollapsed } = useAdminStore()

  const commands = ALL_COMMANDS.map(cmd => {
    if (cmd.id === "home") return { ...cmd, action: () => { setActivePage("home" as any); setOpen(false) } }
    if (cmd.id === "monitoring") return { ...cmd, action: () => { setActivePage("monitoring" as any); setOpen(false) } }
    if (cmd.id === "connection") return { ...cmd, action: () => { setActivePage("connection-settings" as any); setOpen(false) } }
    if (cmd.id === "customers") return { ...cmd, action: () => { setActivePage("customer-settings" as any); setOpen(false) } }
    if (cmd.id === "meters") return { ...cmd, action: () => { setActivePage("meter-settings" as any); setOpen(false) } }
    if (cmd.id === "invoices") return { ...cmd, action: () => { setActivePage("invoices" as any); setOpen(false) } }
    if (cmd.id === "readings") return { ...cmd, action: () => { setActivePage("readings" as any); setOpen(false) } }
    if (cmd.id === "settings") return { ...cmd, action: () => { setActivePage("settings" as any); setOpen(false) } }
    if (cmd.id === "audit") return { ...cmd, action: () => { setActivePage("audit" as any); setOpen(false) } }
    if (cmd.id === "reports") return { ...cmd, action: () => { setActivePage("report-settings" as any); setOpen(false) } }
    if (cmd.id === "toggle-theme") return { ...cmd, action: () => { cycleTheme(); setOpen(false) } }
    if (cmd.id === "toggle-sidebar") return { ...cmd, action: () => { setSidebarCollapsed(!sidebarCollapsed); setOpen(false) } }
    return cmd
  })

  const filtered = query.trim()
    ? commands.filter(c => c.label.toLowerCase().includes(query.toLowerCase()) || c.keywords.some(k => k.includes(query.toLowerCase())))
    : commands

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setOpen(prev => !prev) }
    if (e.key === "Escape") setOpen(false)
  }, [])

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  useEffect(() => {
    if (open) { setTimeout(() => inputRef.current?.focus(), 50); setQuery(""); setSelectedIdx(0) }
  }, [open])

  const executeSelected = () => {
    if (filtered[selectedIdx]) { filtered[selectedIdx].action(); setOpen(false) }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh]" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setOpen(false)}>
          <motion.div initial={{ opacity: 0, y: -20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            className="w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden" style={{ backgroundColor: "var(--surface-raised)", borderColor: "var(--border-default)" }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: "var(--border-default)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
              <input ref={inputRef} value={query} onChange={e => { setQuery(e.target.value); setSelectedIdx(0) }}
                onKeyDown={e => { if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, filtered.length - 1)) } if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)) } if (e.key === "Enter") executeSelected() }}
                placeholder="Search pages and actions..." className="flex-1 bg-transparent text-sm outline-none" style={{ color: "var(--text-primary)" }} />
              <span className="text-[10px] px-1.5 py-0.5 rounded font-mono" style={{ backgroundColor: "var(--border-default)", color: "var(--text-tertiary)" }}>ESC</span>
            </div>
            <div className="max-h-72 overflow-y-auto p-2 space-y-0.5">
              {filtered.length === 0 && <p className="text-xs py-4 text-center" style={{ color: "var(--text-tertiary)" }}>No results for &ldquo;{query}&rdquo;</p>}
              {filtered.map((cmd, i) => (
                <button key={cmd.id} onClick={() => { cmd.action(); setOpen(false) }}
                  onMouseEnter={() => setSelectedIdx(i)}
                  className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm transition-all"
                  style={{ backgroundColor: i === selectedIdx ? "var(--brand)" : "transparent", color: i === selectedIdx ? "#FFFFFF" : "var(--text-primary)" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={cmd.icon} /></svg>
                  <span className="font-medium">{cmd.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
