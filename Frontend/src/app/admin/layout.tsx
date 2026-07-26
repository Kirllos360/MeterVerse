"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { ErrorBoundary } from "@/components/effects/ErrorBoundary"
import { InspectorPanel } from "@/admin/layout/InspectorPanel"
import { AdminToolbar, AdminStatusBar } from "@/admin/layout/AdminToolbar"
import { useAdminStore } from "@/stores/admin-store"

const navGroups = [
  { label: "Core", items: [
    { id: "home", label: "Home", icon: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" },
    { id: "customers", label: "Customers", icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8" },
    { id: "projects", label: "Projects", icon: "M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" },
  ]},
  { label: "Meters", items: [
    { id: "meters", label: "Meters", icon: "M9 3l3-3m0 0l3 3m-3-3v12" },
    { id: "meters-relay", label: "Relay", icon: "M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5" },
    { id: "meter-assignments", label: "Assign", icon: "M8 7h8m-4-4v4m0 12v-4m-6-2h12M4 12h16" },
    { id: "sim", label: "SIM Cards", icon: "M4 7v10c2 0 3 1 3 3h10c2 0 3-1 3-3V7M4 7h16M9 11h6" },
    { id: "readings", label: "Readings", icon: "M9 12l2 2 4-4" },
    { id: "batch-validation", label: "Validate", icon: "M9 12l2 2 4-4m1-7a9 9 0 110 18 9 9 0 010-18z" },
  ]},
  { label: "Location", items: [
    { id: "zones", label: "Zones", icon: "M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    { id: "units", label: "Units", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" },
  ]},
  { label: "Billing", items: [
    { id: "invoices", label: "Invoices", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
    { id: "payments", label: "Payments", icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" },
    { id: "tariffs", label: "Tariffs", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
    { id: "consumption", label: "Consumption", icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" },
  ]},
  { label: "Intelligence", items: [
    { id: "ai-command-center", label: "AI Cmd", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
    { id: "ai-operations", label: "AI Ops", icon: "M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2" },
    { id: "rca-workspace", label: "RCA", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
  ]},
  { label: "System", items: [
    { id: "users", label: "Users", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" },
    { id: "roles", label: "Roles", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
    { id: "audit", label: "Audit", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
    { id: "settings", label: "Settings", icon: "M12 15a3 3 0 100-6 3 3 0 000 6z" },
    { id: "reports", label: "Reports", icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
    { id: "monitoring", label: "Monitor", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  ]},
]

const t = (lang: string, en: string, ar?: string) => lang === "ar" && ar ? ar : en

const PAGE_TABS: Record<string, string[]> = {
  home: ["Overview", "Quick Actions", "Recent"],
  customers: ["Dashboard", "Groups", "Config"],
  meters: ["Dashboard", "Types", "Config"],
  invoices: ["List", "Analytics", "Settings"],
  payments: ["List", "Analytics"],
  users: ["All Users", "Online"],
  settings: ["General", "Security", "Notifications"],
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { activePage, setActivePage, inspectorOpen, setInspectorOpen, sidebarCollapsed, setSidebarCollapsed, themeMode, cycleTheme, lang, toggleLang } = useAdminStore()
  const [tab, setTab] = useState("0")
  const tabsRef = useRef<HTMLDivElement>(null)
  const hour = new Date().getHours()
  const effectiveDark = themeMode === "auto" ? !(hour >= 6 && hour < 18) : themeMode === "dark"
  const isLight = !effectiveDark
  const themeVars = {
    "--brand": "#DC2626", "--brand-rgb": "220,38,38",
    "--surface-base": isLight ? "#F5F5F7" : "#1C1C1E",
    "--surface-topbar": isLight ? "#FFFFFF" : "#1C1C1E",
    "--surface-raised": isLight ? "#FFFFFF" : "#2C2C2E",
    "--sidebar-background": isLight ? "#FFFFFF" : "#1C1C1E",
    "--border-default": isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.1)",
    "--text-primary": isLight ? "#1C1C1E" : "#F5F5F7",
    "--text-secondary": isLight ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.55)",
    "--text-tertiary": isLight ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.3)",
    "--toolbar-bg": isLight ? "rgba(255,255,255,0.85)" : "rgba(28,28,30,0.85)",
    "--toolbar-border": isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.1)",
    "--toolbar-text": isLight ? "#1C1C1E" : "#F5F5F7",
    "--toolbar-muted": isLight ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.3)",
    "--toolbar-surface": isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.05)",
  } as React.CSSProperties

  const currentTabs = PAGE_TABS[activePage] || ["Main"]
  if (!currentTabs[parseInt(tab)] && currentTabs.length > 0) setTab("0")

  return (
    <div style={{ ...themeVars, backgroundColor: "var(--surface-base)" }} dir={lang === "ar" ? "rtl" : "ltr"} className="h-screen w-screen overflow-hidden flex flex-col">
      {/* Header — full width */}
      <AdminToolbar activePage={activePage} onToggleInspector={() => setInspectorOpen(!inspectorOpen)} themeMode={themeMode} onCycleTheme={cycleTheme} effectiveDark={effectiveDark} lang={lang} onToggleLang={toggleLang} />
      
      {/* Tabs bar — under header, full width */}
      <div className="shrink-0 px-4" style={{ backgroundColor: "var(--surface-topbar)", borderBottom: "1px solid var(--border-default)" }}>
        <div ref={tabsRef} className="flex gap-1 overflow-x-auto py-1.5 scrollbar-none">
          {currentTabs.map((label, i) => (
            <button key={i} onClick={() => setTab(String(i))}
              className="shrink-0 px-3 py-1 text-xs font-semibold transition-all whitespace-nowrap"
              style={{ color: tab === String(i) ? "var(--brand)" : "var(--text-tertiary)", borderBottom: tab === String(i) ? "2px solid var(--brand)" : "2px solid transparent" }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Main area — sidebar | content | inspector */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Sidebar — floating design */}
        <div className="shrink-0 p-2" style={{ width: sidebarCollapsed ? 68 : 216 }}>
          <motion.div animate={{ width: sidebarCollapsed ? 52 : 200 }}
            className="h-full flex flex-col overflow-hidden rounded-xl border"
            style={{ backgroundColor: "var(--sidebar-background)", borderColor: "var(--border-default)" }}>
            {/* Logo area */}
            <div className="shrink-0 flex items-center justify-center py-3 px-3" style={{ borderBottom: "1px solid var(--border-default)" }}>
              {sidebarCollapsed ? (
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 3 }} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--brand)" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                </motion.div>
              ) : (
                <div className="flex items-center gap-2.5 w-full">
                  <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 3 }} className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center" style={{ backgroundColor: "var(--brand)" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                  </motion.div>
                  <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>MeterVerse</span>
                </div>
              )}
            </div>

            {/* Nav items */}
            <div className="flex-1 overflow-y-auto py-2 px-1.5 space-y-3 scrollbar-thin">
              {navGroups.map(group => (
                <div key={group.label}>
                  {!sidebarCollapsed && <p className="text-[9px] font-bold uppercase tracking-wider px-2 mb-1" style={{ color: "var(--text-tertiary)" }}>{group.label}</p>}
                  <div className="space-y-0.5">
                    {group.items.map(item => {
                      const isActive = activePage === item.id
                      return (
                        <motion.button key={item.id} onClick={() => setActivePage(item.id as any)}
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          className="flex items-center w-full rounded-lg text-xs outline-none relative overflow-hidden transition-all"
                          style={{ padding: sidebarCollapsed ? "10px 8px" : "8px 12px", color: isActive ? "#FFFFFF" : "var(--text-secondary)", fontWeight: isActive ? 700 : 500 }}>
                          {isActive && <motion.div layoutId="navBg" className="absolute inset-0 rounded-lg" style={{ backgroundColor: "var(--brand)" }} />}
                          {!isActive && <div className="absolute inset-0 rounded-lg hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors" />}
                          <span className="relative z-10 flex items-center gap-2.5">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={isActive ? 2.5 : 1.5} className="shrink-0"><path d={item.icon} /></svg>
                            {!sidebarCollapsed && <span className="truncate">{t(lang, item.label)}</span>}
                          </span>
                        </motion.button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Collapse toggle */}
            <motion.button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center py-2 shrink-0 mx-2 mb-2 rounded-lg"
              style={{ borderTop: "1px solid var(--border-default)", color: "var(--text-tertiary)" }}>
              <motion.svg animate={{ rotate: sidebarCollapsed ? 180 : 0 }} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></motion.svg>
            </motion.button>
          </motion.div>
        </div>

        {/* Content area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto p-6">
            {children ? <ErrorBoundary>{children}</ErrorBoundary> : null}
          </div>
        </div>

        {/* Inspector — same design as sidebar */}
        {inspectorOpen && (
          <div className="shrink-0 p-2" style={{ width: 364 }}>
            <InspectorPanel collapsed={false} onToggleCollapse={() => setInspectorOpen(false)} />
          </div>
        )}
      </div>

      {/* Footer — full width like header */}
      <div className="shrink-0 px-4 py-2 flex items-center justify-between text-[11px]" style={{ backgroundColor: "var(--surface-topbar)", borderTop: "1px solid var(--border-default)", color: "var(--text-tertiary)" }}>
        <div className="flex items-center gap-3">
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 4 }} className="w-4 h-4 rounded-full" style={{ backgroundColor: "var(--brand)" }} />
          <span className="font-semibold" style={{ color: "var(--text-secondary)" }}>MeterVerse v8.0</span>
          <span>·</span>
          <span>System {effectiveDark ? "Dark" : "Light"} Mode</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500" /> All Systems Normal</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--brand)" }} /> {activePage}</span>
        </div>
      </div>
    </div>
  )
}
