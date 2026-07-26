"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ErrorBoundary } from "@/components/effects/ErrorBoundary"
import { InspectorPanel } from "@/admin/layout/InspectorPanel"
import { AdminToolbar } from "@/admin/layout/AdminToolbar"
import { useAdminStore } from "@/stores/admin-store"

// SYSTEM TAB DEFINITIONS
const SYSTEM_TABS = [
  { id: "admin", label: "Admin", icon: "M12 15V3m0 12l-4-4m4 4l4-4" },
  { id: "dashboard", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { id: "analytics", label: "Analytics", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  { id: "system", label: "System", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
]

// SIDEBAR NAV — MAIN PAGES ONLY
const navGroups = [
  { label: "Main", items: [
    { id: "home", label: "Home", icon: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" },
    { id: "customers", label: "Customers", icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8" },
    { id: "meters", label: "Meters", icon: "M9 3l3-3m0 0l3 3m-3-3v12" },
    { id: "projects", label: "Projects", icon: "M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" },
  ]},
  { label: "Location", items: [
    { id: "zones", label: "Zones", icon: "M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    { id: "units", label: "Units", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" },
  ]},
  { label: "Billing", items: [
    { id: "invoices", label: "Invoices", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
    { id: "payments", label: "Payments", icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" },
    { id: "tariffs", label: "Tariffs", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
  ]},
  { label: "System", items: [
    { id: "users", label: "Users", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1z" },
    { id: "settings", label: "Settings", icon: "M12 15a3 3 0 100-6 3 3 0 000 6z" },
    { id: "reports", label: "Reports", icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586" },
    { id: "monitoring", label: "Monitor", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2z" },
    { id: "audit", label: "Audit", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" },
  ]},
]

// PAGE SUB-TABS (sub-pages become tabs inside the main page)
const PAGE_SUB_TABS: Record<string, { id: string; label: string }[]> = {
  meters: [
    { id: "", label: "Dashboard" },
    { id: "relay", label: "Relay" },
    { id: "meter-assignments", label: "Assign" },
    { id: "sim", label: "SIM Cards" },
    { id: "readings", label: "Readings" },
  ],
  customers: [
    { id: "", label: "Dashboard" },
    { id: "groups", label: "Groups" },
    { id: "config", label: "Config" },
  ],
  invoices: [
    { id: "", label: "Dashboard" },
    { id: "analytics", label: "Analytics" },
    { id: "settings", label: "Settings" },
  ],
  settings: [
    { id: "", label: "General" },
    { id: "security", label: "Security" },
    { id: "notifications", label: "Notifications" },
  ],
}

const t = (lang: string, en: string, ar?: string) => lang === "ar" && ar ? ar : en

// Pulse/wave animation
const waveAnim = {
  scale: [1, 1.06, 1],
  opacity: [0.7, 1, 0.7],
  transition: { repeat: Infinity, duration: 2.5, ease: "easeInOut" }
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { activePage, setActivePage, inspectorOpen, setInspectorOpen, sidebarCollapsed, setSidebarCollapsed, themeMode, cycleTheme, lang, toggleLang } = useAdminStore()
  const [systemTab, setSystemTab] = useState("admin")
  const [subTab, setSubTab] = useState("")
  const [prevPage, setPrevPage] = useState("")
  const contentRef = useRef<HTMLDivElement>(null)
  const hour = new Date().getHours()
  const effectiveDark = themeMode === "auto" ? !(hour >= 6 && hour < 18) : themeMode === "dark"
  const isLight = !effectiveDark

  // Page transition effect
  useEffect(() => {
    if (prevPage !== activePage) {
      setPrevPage(activePage)
      if (contentRef.current) {
        contentRef.current.style.opacity = "0"
        contentRef.current.style.transform = "translateY(6px)"
        setTimeout(() => {
          if (contentRef.current) {
            contentRef.current.style.opacity = "1"
            contentRef.current.style.transform = "translateY(0)"
          }
        }, 50)
      }
    }
    setSubTab("")
  }, [activePage])

  const themeVars = {
    "--brand": "#DC2626", "--brand-rgb": "220,38,38",
    "--surface-base": isLight ? "#F2F2F5" : "#121214",
    "--surface-topbar": isLight ? "#FFFFFF" : "#1A1A1E",
    "--surface-raised": isLight ? "#FFFFFF" : "#1E1E22",
    "--sidebar-background": isLight ? "#FFFFFF" : "#1A1A1E",
    "--border-default": isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.08)",
    "--text-primary": isLight ? "#1C1C1E" : "#F2F2F5",
    "--text-secondary": isLight ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.5)",
    "--text-tertiary": isLight ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.25)",
    "--toolbar-bg": isLight ? "rgba(255,255,255,0.8)" : "rgba(26,26,30,0.8)",
    "--toolbar-border": isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.08)",
    "--toolbar-text": isLight ? "#1C1C1E" : "#F2F2F5",
    "--toolbar-muted": isLight ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.25)",
    "--toolbar-surface": isLight ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.04)",
    "--admin-surface": isLight ? "#F2F2F5" : "#222226",
    "--admin-border": isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.08)",
    "--admin-accent": "#DC2626",
  } as React.CSSProperties

  const goHome = () => setActivePage("home" as any)
  const subTabs = PAGE_SUB_TABS[activePage] || []

  return (
    <div style={{ ...themeVars, backgroundColor: "var(--surface-base)" }} dir={lang === "ar" ? "rtl" : "ltr"} className="h-screen w-screen overflow-hidden flex flex-col">
      
      {/* HEADER — full width */}
      <AdminToolbar activePage={activePage} onToggleInspector={() => setInspectorOpen(!inspectorOpen)} themeMode={themeMode} onCycleTheme={cycleTheme} effectiveDark={effectiveDark} lang={lang} onToggleLang={toggleLang} onLogoClick={goHome} />

      {/* SYSTEM TABS — top level tabs with different visual */}
      <div className="shrink-0 px-3" style={{ backgroundColor: "var(--surface-topbar)", borderBottom: "1px solid var(--toolbar-border)" }}>
        <div className="flex gap-0.5 overflow-x-auto py-1 scrollbar-none">
          {SYSTEM_TABS.map(tab => (
            <button key={tab.id} onClick={() => setSystemTab(tab.id)}
              className="flex items-center gap-2 shrink-0 px-3.5 py-1.5 text-xs font-semibold transition-all rounded-t-lg relative"
              style={{ color: systemTab === tab.id ? "var(--brand)" : "var(--text-tertiary)" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={systemTab === tab.id ? 2.5 : 1.5}><path d={tab.icon} /></svg>
              {tab.label}
              {systemTab === tab.id && (
                <motion.div layoutId="sysTab" className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full" style={{ backgroundColor: "var(--brand)" }} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT AREA — sidebar | tabs+content | inspector */}
      <div className="flex flex-1 min-h-0 overflow-hidden p-2 gap-2">

        {/* SIDEBAR — main pages only */}
        <div className="shrink-0" style={{ width: sidebarCollapsed ? 64 : 210 }}>
          <motion.div animate={{ width: sidebarCollapsed ? 48 : 194 }}
            className="h-full flex flex-col overflow-hidden rounded-2xl border overflow-y-auto scrollbar-none"
            style={{ backgroundColor: "var(--sidebar-background)", borderColor: "var(--border-default)", scrollbarWidth: "none", msOverflowStyle: "none" }}>
            
            <div className="flex-1 py-2.5 px-1.5 space-y-3">
              {navGroups.map(group => (
                <div key={group.label}>
                  {!sidebarCollapsed && (
                    <p className="text-[9px] font-bold uppercase tracking-widest px-2.5 mb-1.5" style={{ color: "var(--text-tertiary)" }}>{group.label}</p>
                  )}
                  <div className="space-y-0.5">
                    {group.items.map(item => {
                      const isActive = activePage === item.id
                      return (
                        <motion.button key={item.id} onClick={() => setActivePage(item.id as any)}
                          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                          className="flex items-center w-full rounded-xl text-xs outline-none relative overflow-hidden transition-all"
                          style={{ padding: sidebarCollapsed ? "11px 9px" : "8px 12px" }}>
                          
                          {isActive && (
                            <motion.div layoutId="navBg" className="absolute inset-0 rounded-xl"
                              animate={{ backgroundColor: "rgba(220,38,38,0.12)" }} />
                          )}
                          {!isActive && (
                            <div className="absolute inset-0 rounded-xl hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors" />
                          )}
                          
                          <span className="relative z-10 flex items-center gap-3" style={{ color: isActive ? "var(--brand)" : "var(--text-secondary)", fontWeight: isActive ? 700 : 500 }}>
                            <motion.span animate={isActive ? waveAnim : {}} className="shrink-0">
                              <svg width="17" height="17" viewBox="0 0 24 24" fill={isActive ? "var(--brand)" : "none"} stroke="currentColor" strokeWidth={isActive ? 2.5 : 1.5} className="shrink-0">
                                <path d={item.icon} />
                              </svg>
                            </motion.span>
                            {!sidebarCollapsed && <span className="truncate">{t(lang, item.label)}</span>}
                          </span>
                        </motion.button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            <motion.button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center py-2.5 shrink-0 mx-1.5 mb-2 rounded-xl"
              style={{ borderTop: "1px solid var(--border-default)", color: "var(--text-tertiary)" }}>
              <motion.svg animate={{ rotate: sidebarCollapsed ? 180 : 0 }} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></motion.svg>
            </motion.button>
          </motion.div>
        </div>

        {/* CONTENT COLUMN — sub-tabs + page */}
        <div className="flex-1 flex flex-col min-w-0 gap-2">
          {/* PAGE SUB-TABS — under system tabs, between sidebar & inspector */}
          {subTabs.length > 0 && (
            <div className="shrink-0 rounded-2xl border px-2" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
              <div className="flex gap-1 overflow-x-auto py-1 scrollbar-none">
                {subTabs.map(t => (
                  <button key={t.id} onClick={() => setSubTab(t.id)}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-all rounded-xl whitespace-nowrap"
                    style={{ backgroundColor: subTab === t.id ? "var(--brand)" : "transparent", color: subTab === t.id ? "#FFFFFF" : "var(--text-secondary)" }}>
                    {subTab === t.id && <motion.span animate={waveAnim} className="w-1.5 h-1.5 rounded-full bg-white" />}
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* PAGE CONTENT — with animated borders in dark mode */}
          <div className="flex-1 overflow-y-auto p-[1px] scrollbar-thin" style={{ scrollbarWidth: "thin" }}>
            <motion.div ref={contentRef}
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
              className="h-full rounded-2xl border p-5 overflow-y-auto content-panel"
              style={{
                backgroundColor: "var(--surface-raised)",
                borderColor: isLight ? "var(--border-default)" : "rgba(220,38,38,0.2)",
                boxShadow: isLight ? "none" : "inset 0 0 60px rgba(220,38,38,0.03)",
                transition: "border-color 0.3s ease, box-shadow 0.3s ease",
              }}>
              {children ? <ErrorBoundary>{children}</ErrorBoundary> : null}
            </motion.div>
          </div>
        </div>

        {/* INSPECTOR — matching sidebar */}
        {inspectorOpen && (
          <div className="shrink-0" style={{ width: 360 }}>
            <InspectorPanel collapsed={false} onToggleCollapse={() => setInspectorOpen(false)} />
          </div>
        )}
      </div>

      {/* FOOTER — full width */}
      <div className="shrink-0 px-4 py-1.5 flex items-center justify-between text-[10px]" style={{ backgroundColor: "var(--surface-topbar)", borderTop: "1px solid var(--border-default)", color: "var(--text-tertiary)" }}>
        <div className="flex items-center gap-2">
          <motion.div animate={waveAnim} className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: "var(--brand)" }} />
          <span className="font-semibold" style={{ color: "var(--text-secondary)" }}>Meter Verse v8.0</span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">{isLight ? "Light" : "Dark"} · {lang.toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--brand)" }} /> All Systems Normal</span>
          <span className="w-1 h-4" style={{ borderLeft: "1px solid var(--border-default)" }} />
          <motion.span animate={waveAnim} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--brand)" }} />
        </div>
      </div>
    </div>
  )
}
