"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

function TbBtn({ children, label, onClick, isActive }: { children: React.ReactNode; label: string; onClick: () => void; isActive?: boolean }) {
  return (
    <button onClick={onClick} className="w-8 h-8 flex items-center justify-center rounded-lg transition-all hover:bg-black/5 dark:hover:bg-white/10 active:scale-95" style={{ color: isActive ? "var(--admin-accent)" : "var(--toolbar-muted)" }} title={label} aria-label={label}>
      {children}
    </button>
  )
}

const MODE_ICONS: Record<string, string> = { light: "☀️", dark: "🌙", auto: "⚙️" }
const t = (lang: string, en: string, ar: string) => lang === "ar" ? ar : en

export function AdminToolbar({ activePage, onToggleInspector, themeMode = "auto", onCycleTheme, effectiveDark, lang = "en", onToggleLang }: any) {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const searchRef = useRef<HTMLInputElement>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus()
  }, [searchOpen])

  // Close search on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchOpen(false)
        setSearchQuery("")
      }
    }
    if (searchOpen) document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [searchOpen])

  const searchItems = [
    { cat: "Pages", items: [
      { label: "Home", id: "home" }, { label: "Customers", id: "customers" }, { label: "Meters", id: "meters" },
      { label: "Invoices", id: "invoices" }, { label: "Payments", id: "payments" }, { label: "Users", id: "users" },
      { label: "Settings", id: "settings" }, { label: "Monitoring", id: "monitoring" },
    ]},
    { cat: "Tools", items: [
      { label: "API Explorer", action: "inspector" }, { label: "RCA Workspace", id: "rca-workspace" },
      { label: "AI Command Center", id: "ai-command-center" }, { label: "Audit Log", id: "audit" },
    ]},
  ]

  const filteredSearch = searchQuery.trim()
    ? searchItems.map(g => ({ ...g, items: g.items.filter(i => i.label.toLowerCase().includes(searchQuery.toLowerCase())) })).filter(g => g.items.length > 0)
    : []

  return (
    <div className="flex items-center h-14 px-4 gap-3 shrink-0" style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", backgroundColor: "var(--toolbar-bg)", borderBottom: "1px solid var(--toolbar-border)" }}>
      
      {/* Logo — pulsating circle + Meter Verse name */}
      <div className="flex items-center gap-2.5 min-w-0 shrink-0">
        <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }} className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center" style={{ backgroundColor: "var(--brand)", boxShadow: "0 0 12px rgba(var(--brand-rgb),0.3)" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
        </motion.div>
        <div className="hidden md:block leading-tight">
          <div className="text-sm font-bold tracking-tight" style={{ color: "var(--toolbar-text)" }}>Meter Verse</div>
          <div className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: "var(--toolbar-muted)" }}>Administration</div>
        </div>
      </div>

      {/* Search — Dynamic Island style */}
      <div ref={searchContainerRef} className="relative flex-1 max-w-md mx-auto">
        <motion.div
          animate={{ width: searchOpen ? "100%" : "240px" }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative flex items-center"
          style={{ backgroundColor: "var(--toolbar-surface)", borderRadius: "10px", border: searchOpen ? "1.5px solid var(--brand)" : "1px solid transparent" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 shrink-0" style={{ color: "var(--toolbar-muted)" }}><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
          <input ref={searchRef} value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setSearchOpen(true) }} onFocus={() => setSearchOpen(true)}
            placeholder="Search pages, tools, settings..." className="w-full bg-transparent outline-none text-xs py-2.5 pl-9 pr-3"
            style={{ color: "var(--toolbar-text)" }} />
          {searchQuery && (
            <button onClick={() => { setSearchQuery(""); setSearchOpen(false) }} className="absolute right-2 text-[10px] p-1 rounded hover:bg-black/10 dark:hover:bg-white/10" style={{ color: "var(--toolbar-muted)" }}>✕</button>
          )}
        </motion.div>

        {/* Search dropdown */}
        <AnimatePresence>
          {searchOpen && filteredSearch.length > 0 && (
            <motion.div initial={{ opacity: 0, y: -4, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4, scale: 0.97 }}
              className="absolute top-full mt-1.5 left-0 right-0 rounded-xl overflow-hidden z-50 shadow-lg"
              style={{ backgroundColor: "var(--surface-raised)", border: "1px solid var(--border-default)" }}>
              {filteredSearch.map(group => (
                <div key={group.cat} className="p-1.5">
                  <p className="text-[9px] font-bold uppercase tracking-wider px-2 py-1" style={{ color: "var(--text-tertiary)" }}>{group.cat}</p>
                  {group.items.map(item => (
                    <button key={item.label} className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-xs transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                      style={{ color: "var(--text-primary)" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                      {item.label}
                    </button>
                  ))}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right icons */}
      <div className="flex items-center gap-1 shrink-0">
        <TbBtn label={t(lang, "Toggle Inspector", "إظهار/إخفاء المفتش")} onClick={() => onToggleInspector?.()}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="15" y1="3" x2="15" y2="21" /></svg>
        </TbBtn>

        <TbBtn label={`${t(lang, "Theme", "المظهر")}: ${themeMode}`} onClick={() => onCycleTheme?.()}>
          <span className="text-sm">{MODE_ICONS[themeMode]}</span>
        </TbBtn>

        <TbBtn label={`${t(lang, "Language", "اللغة")}: ${lang.toUpperCase()}`} onClick={() => onToggleLang?.()}>
          <span className="text-xs font-bold">{lang.toUpperCase()}</span>
        </TbBtn>

        {/* User menu */}
        <div className="relative">
          <button onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-lg transition-all hover:bg-black/5 dark:hover:bg-white/10 px-2 py-1 active:scale-95">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: "var(--admin-accent)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z"/></svg>
            </div>
            <div className="hidden lg:block text-left leading-tight">
              <div className="text-sm font-bold tracking-tight" style={{ color: "var(--toolbar-text)" }}>Admin User</div>
              <div className="text-[10px] font-medium" style={{ color: "var(--toolbar-muted)" }}>{t(lang, "Administrator", "مسؤول النظام")}</div>
            </div>
            <motion.svg animate={{ rotate: showUserMenu ? 180 : 0 }} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6" /></motion.svg>
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div initial={{ opacity: 0, y: -4, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4, scale: 0.95 }}
                transition={{ duration: 0.12 }} className="absolute right-0 top-full mt-2 w-56 rounded-xl z-50 overflow-hidden shadow-lg"
                style={{ backgroundColor: "var(--surface-raised)", border: "1px solid var(--border-default)" }}
                onClick={() => setShowUserMenu(false)}>
                <div className="p-3 border-b" style={{ borderColor: "var(--border-default)" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: "var(--admin-accent)" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z"/></svg>
                    </div>
                    <div>
                      <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Admin User</div>
                      <div className="text-xs" style={{ color: "var(--text-tertiary)" }}>admin@meterverse.com</div>
                    </div>
                  </div>
                </div>
                <div className="p-1">
                  {[
                    { icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", label: t(lang, "My Profile", "ملفي الشخصي") },
                    { icon: "M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 004.561 21h14.878a2 2 0 001.94-1.515L22 17", label: t(lang, "Account Settings", "إعدادات الحساب") },
                  ].map((item, i) => (
                    <button key={i} className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/10" style={{ color: "var(--text-primary)" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={item.icon} /></svg>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
                <div className="border-t p-1" style={{ borderColor: "var(--border-default)" }}>
                  <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/10" style={{ color: "var(--admin-accent)" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></svg>
                    <span>{t(lang, "Sign Out", "تسجيل الخروج")}</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export function AdminStatusBar({ inspectorOpen, onToggleInspector, lang = "en" }: any) {
  return (
    <div className="flex items-center h-14 px-4 gap-2 text-xs shrink-0" style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", backgroundColor: "var(--toolbar-bg)", borderTop: "1px solid var(--toolbar-border)", color: "var(--toolbar-muted)" }}>
      <span style={{ color: "var(--admin-accent)" }}>●</span>
      <span>All Systems Operational</span>
      <span style={{ color: "var(--toolbar-border)" }}>|</span>
      <span>78 Models · 165 APIs · 42 Pages</span>
      <div className="flex-1" />
      <span style={{ color: "var(--toolbar-muted)" }}>Powering progress, one meter at a time</span>
      {onToggleInspector && (
        <button onClick={onToggleInspector} className="flex items-center gap-1 text-[10px] outline-none transition-colors hover:opacity-80" style={{ color: inspectorOpen ? "var(--admin-accent)" : "var(--toolbar-muted)" }}>
          <motion.span animate={{ rotate: inspectorOpen ? 180 : 0 }}>◀</motion.span>
          <span>Inspector</span>
        </button>
      )}
    </div>
  )
}
