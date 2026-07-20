"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface AdminToolbarProps {
  activePage: string
  viewMode?: "list" | "grid"
  onViewModeChange?: (mode: "list" | "grid") => void
  onToggleInspector?: () => void
  darkMode?: boolean
  onToggleDarkMode?: () => void
}

export function AdminToolbar({ activePage, viewMode = "list", onViewModeChange, onToggleInspector, darkMode = true, onToggleDarkMode }: AdminToolbarProps) {
  const [showLang, setShowLang] = useState(false)
  const [lang, setLang] = useState("en")
  const [showNotifications, setShowNotifications] = useState(false)

  const toggleLang = () => setLang(l => l === "en" ? "ar" : "en")

  return (
    <div className="flex items-center h-11 px-4 gap-2" style={{ backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", backgroundColor: "var(--toolbar-bg)", borderBottom: "1px solid var(--toolbar-border)", zIndex: 10 }}>
      
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "var(--admin-accent)", boxShadow: "0 0 10px rgba(220,38,38,0.3)" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
        </div>
        <span className="text-sm font-semibold" style={{ color: "var(--toolbar-text)" }}>MeterVerse</span>
        <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(220,38,38,0.15)", color: "var(--admin-accent)" }}>Admin</span>
      </div>

      {/* View toggle (list/grid) */}
      {onViewModeChange && (
        <div className="flex items-center ml-3 gap-0.5 p-0.5 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
          <motion.button onClick={() => onViewModeChange("list")} whileTap={{ scale: 0.9 }}
            className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] outline-none"
            style={{ backgroundColor: viewMode === "list" ? "rgba(220,38,38,0.2)" : "transparent", color: viewMode === "list" ? "var(--admin-accent)" : "rgba(255,255,255,0.3)", cursor: "pointer", border: "none" }}>
            ☰
          </motion.button>
          <motion.button onClick={() => onViewModeChange("grid")} whileTap={{ scale: 0.9 }}
            className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] outline-none"
            style={{ backgroundColor: viewMode === "grid" ? "rgba(220,38,38,0.2)" : "transparent", color: viewMode === "grid" ? "var(--admin-accent)" : "rgba(255,255,255,0.3)", cursor: "pointer", border: "none" }}>
            ⊞
          </motion.button>
        </div>
      )}

      {/* Search */}
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg flex-1 max-w-[200px]" style={{ backgroundColor: "var(--toolbar-surface)", border: "1px solid var(--toolbar-border)" }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--toolbar-muted)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input placeholder="Search admin..." className="w-full bg-transparent outline-none text-xs" style={{ color: "var(--toolbar-text)" }} />
      </div>

      <div className="flex-1" />

      {/* Right icons */}
      <div className="flex items-center gap-1">
        {/* Language */}
        <div className="relative">
          <motion.button onClick={() => setShowLang(!showLang)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-semibold outline-none" style={{ backgroundColor: "var(--toolbar-surface)", color: "var(--toolbar-text)", cursor: "pointer", border: "none" }}>
            {lang === "en" ? "EN" : "AR"}
          </motion.button>
          <AnimatePresence>
            {showLang && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                className="absolute right-0 top-full mt-1 rounded-xl p-1 z-50" style={{ backgroundColor: "#0D0D0D", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 8px 30px rgba(0,0,0,0.4)", minWidth: 90 }}>
                {["en","ar"].map(l => (
                  <button key={l} onClick={() => { setLang(l); setShowLang(false) }}
                    className="w-full px-3 py-1.5 rounded-lg text-xs text-left outline-none" style={{ backgroundColor: lang === l ? "rgba(220,38,38,0.15)" : "transparent", color: lang === l ? "var(--admin-accent)" : "rgba(255,255,255,0.6)", cursor: "pointer", border: "none" }}>
                    {l === "en" ? "English" : "العربية"}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Theme */}
        {onToggleDarkMode && (
          <motion.button onClick={onToggleDarkMode} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs outline-none" style={{ backgroundColor: "var(--toolbar-surface)", color: "var(--toolbar-text)", cursor: "pointer", border: "none" }}>
            {darkMode ? "🌙" : "☀️"}
          </motion.button>
        )}

        {/* Notifications */}
        <div className="relative">
          <motion.button onClick={() => setShowNotifications(!showNotifications)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs outline-none relative" style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)", cursor: "pointer", border: "none" }}>
            🔔
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold text-white" style={{ backgroundColor: "var(--admin-accent)" }}>3</span>
          </motion.button>
          <AnimatePresence>
            {showNotifications && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                className="absolute right-0 top-full mt-1 rounded-xl p-2 z-50" style={{ backgroundColor: "#0D0D0D", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 8px 30px rgba(0,0,0,0.4)", minWidth: 220 }}>
                {[{t:"System health check passed",ts:"2m"},{t:"Backup completed",ts:"15m"},{t:"New user registered",ts:"1h"}].map((n,i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--admin-accent)" }} />
                    <span className="flex-1">{n.t}</span>
                    <span style={{ color: "rgba(255,255,255,0.3)" }}>{n.ts}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Inspector toggle */}
        {onToggleInspector && (
          <motion.button onClick={onToggleInspector} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs outline-none" style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)", cursor: "pointer", border: "none" }} title="Toggle Inspector">
            &lt;/&gt;
          </motion.button>
        )}

        {/* Page indicator */}
        <div className="ml-1 text-[11px] px-2.5 py-1 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.35)" }}>{activePage}</div>
      </div>
    </div>
  )
}

interface AdminStatusBarProps {
  inspectorOpen?: boolean
  onToggleInspector?: () => void
}

export function AdminStatusBar({ inspectorOpen, onToggleInspector }: AdminStatusBarProps) {
  const quotes = [
    "Powering progress, one meter at a time",
    "Precision in every reading",
    "Data-driven decisions for tomorrow",
    "All systems operational",
  ]

  return (
    <div className="flex items-center h-7 px-4 gap-2 text-[11px]" style={{ backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", backgroundColor: "var(--toolbar-bg)", borderTop: "1px solid var(--toolbar-border)", color: "var(--toolbar-text)" }}>
      <span style={{ color: "var(--admin-accent)" }}>●</span>
      <span>All Systems Operational</span>
      <span style={{ color: "rgba(255,255,255,0.15)" }}>|</span>
      <span>78 Models · 165 APIs · 42 Pages</span>
      <div className="flex-1" />
      <span style={{ color: "rgba(255,255,255,0.2)" }}>{quotes[Math.floor(Math.random() * quotes.length)]}</span>
      <div className="flex items-center gap-2 ml-2">
        {onToggleInspector && (
          <motion.button onClick={onToggleInspector} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            className="text-[10px] outline-none flex items-center gap-1" style={{ color: inspectorOpen ? "var(--admin-accent)" : "rgba(255,255,255,0.25)", cursor: "pointer", background: "none", border: "none" }}>
            <motion.span animate={{ rotate: inspectorOpen ? 180 : 0 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}>◀</motion.span>
            <span>Inspector</span>
          </motion.button>
        )}
      </div>
    </div>
  )
}
