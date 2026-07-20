"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export function AdminToolbar({ activePage }: { activePage: string }) {
  const [showLang, setShowLang] = useState(false)
  const [lang, setLang] = useState("en")
  const [showNotifications, setShowNotifications] = useState(false)
  const [theme, setTheme] = useState("dark")

  const toggleLang = () => setLang(l => l === "en" ? "ar" : "en")
  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark")

  return (
    <div className="flex items-center h-11 px-4 gap-2" style={{ backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", backgroundColor: "rgba(10,10,10,0.7)", borderBottom: "1px solid rgba(255,255,255,0.05)", position: "relative", zIndex: 10 }}>
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: "var(--admin-accent)", color: "white", boxShadow: "0 0 10px rgba(220,38,38,0.3)" }}>MV</div>
        <span className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.9)" }}>MeterVerse</span>
        <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(220,38,38,0.15)", color: "var(--admin-accent)" }}>Admin</span>
      </div>

      <div className="flex-1" />

      {/* Right side icons */}
      <div className="flex items-center gap-1">
        {/* Language selector */}
        <div className="relative">
          <motion.button onClick={() => setShowLang(!showLang)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-semibold outline-none" style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)", cursor: "pointer", border: "none" }}>
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

        {/* Theme toggle */}
        <motion.button onClick={toggleTheme} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-xs outline-none" style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)", cursor: "pointer", border: "none" }}>
          {theme === "dark" ? "🌙" : "☀️"}
        </motion.button>

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
                {[{t:"System health check passed",s:"success",ts:"2m"},{t:"Backup completed",s:"success",ts:"15m"},{t:"New user registered",s:"info",ts:"1h"}].map((n,i) => (
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

        {/* Page indicator */}
        <div className="ml-2 text-[11px] px-2.5 py-1 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.35)" }}>{activePage}</div>
      </div>
    </div>
  )
}

export function AdminStatusBar() {
  return (
    <div className="flex items-center h-7 px-4 gap-2 text-[11px]" style={{ backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", backgroundColor: "rgba(10,10,10,0.7)", borderTop: "1px solid rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)", position: "relative", zIndex: 10 }}>
      <span style={{ color: "var(--admin-accent)" }}>●</span>
      <span>All Systems Operational</span>
      <span style={{ color: "rgba(255,255,255,0.15)" }}>|</span>
      <span>78 Models · 165 APIs · 42 Pages</span>
      <div className="flex-1" />
      <span style={{ color: "rgba(255,255,255,0.25)" }}>MeterVerse v8.0.0</span>
      <span style={{ color: "rgba(255,255,255,0.15)" }}>|</span>
      <span style={{ color: "rgba(255,255,255,0.25)" }}>Admin Panel</span>
    </div>
  )
}
