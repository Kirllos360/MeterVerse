"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ErrorBoundary } from "@/components/effects/ErrorBoundary"
import { InspectorPanel } from "@/admin/layout/InspectorPanel"
import { AdminToolbar } from "@/admin/layout/AdminToolbar"
import { useAdminStore } from "@/stores/admin-store"
import { LocationSelector } from "@/features/admin-settings/components/LocationSelector"
import { CommandPalette } from "@/features/admin-settings/components/CommandPalette"
import { Breadcrumbs } from "@/features/admin-settings/components/Breadcrumbs"

const SYSTEM_TABS = [
  { id: "admin", label: "Admin", icon: "M12 15V3m0 12l-4-4m4 4l4-4" },
  { id: "dashboard", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7" },
  { id: "analytics", label: "Analytics", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2z" },
  { id: "system", label: "System", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0" },
]

const ALL_NAV_ITEMS = [
  { id: "home", label: "Home", icon: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" },
  { id: "monitoring", label: "Monitoring", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2" },
  { id: "connection-settings", label: "Connection", icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9" },
  { id: "database-management", label: "Database Management", icon: "M4 7v10c2 0 3 1 3 3h10c2 0 3-1 3-3V7M4 7h16" },
  { id: "migration-uploads", label: "Migration & Uploads", icon: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5m0 0L7 8m5-5v12" },
  { id: "location-settings", label: "Location", icon: "M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { id: "users-permissions", label: "Users & Permissions", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1z" },
  { id: "customer-settings", label: "Customer", icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" },
  { id: "meter-settings", label: "Meter", icon: "M9 3l3-3m0 0l3 3m-3-3v12" },
  { id: "readings", label: "Readings", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  { id: "tariff-settings", label: "Tariff", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0" },
  { id: "bill-cycle-settings", label: "Billing Cycles", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7" },
  { id: "invoices", label: "Invoices", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586" },
  { id: "payment-settings", label: "Payment", icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2" },
  { id: "settings", label: "General Settings", icon: "M12 15a3 3 0 100-6 3 3 0 000 6z" },
  { id: "audit", label: "Audit Log", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" },
  { id: "report-settings", label: "Reports", icon: "M9 17v-2m3 2v-4m3 4v-6" },
]

const PAGE_SUB_TABS: Record<string, { id: string; label: string }[]> = {
  monitoring: [{ id: "", label: "Dashboard" }, { id: "events", label: "Events" }, { id: "logs", label: "Logs" }],
  customers: [{ id: "", label: "Dashboard" }, { id: "groups", label: "Groups" }, { id: "config", label: "Config" }],
  invoices: [{ id: "", label: "Dashboard" }, { id: "analytics", label: "Analytics" }, { id: "settings", label: "Settings" }],
  settings: [{ id: "", label: "General" }, { id: "security", label: "Security" }, { id: "notifications", label: "Notifications" }],
  "meter-settings": [{ id: "", label: "Meter Types" }, { id: "settings", label: "Main Settings" }, { id: "events", label: "Event Log" }, { id: "errors", label: "Error Log" }],
}

const t = (lang: string, en: string, ar?: string) => lang === "ar" && ar ? ar : en

const waveAnim = { scale: [1, 1.12, 1], opacity: [0.6, 1, 0.6], transition: { repeat: Infinity, duration: 2, ease: "easeInOut" } }

interface SystemLayoutProps {
  children: React.ReactNode
  theme?: "red" | "green"
  title?: string
}

export default function SystemLayout({ children, theme = "red", title = "Administration" }: SystemLayoutProps) {
  const isGreen = false
  const brandColor = isGreen ? "#059669" : "#DC2626"
  const brandRgb = isGreen ? "5,150,105" : "220,38,38"

  const { activePage, setActivePage, openPages, addOpenPage, removeOpenPage, inspectorOpen, setInspectorOpen, sidebarCollapsed, setSidebarCollapsed, themeMode, cycleTheme, lang, toggleLang } = useAdminStore()
  const [systemTab, setSystemTab] = useState("admin")
  const [subTab, setSubTab] = useState("")
  const [prevPage, setPrevPage] = useState("")
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const hour = new Date().getHours()
  const effectiveDark = themeMode === "auto" ? !(hour >= 6 && hour < 18) : themeMode === "dark"
  const isLight = !effectiveDark

  const handleMouse = useCallback((e: MouseEvent) => {
    setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight })
  }, [])
  useEffect(() => { window.addEventListener("mousemove", handleMouse); return () => window.removeEventListener("mousemove", handleMouse) }, [handleMouse])

  useEffect(() => {
    if (prevPage !== activePage) {
      setPrevPage(activePage)
      if (contentRef.current) {
        contentRef.current.style.opacity = "0"
        contentRef.current.style.transform = "translateY(8px)"
        setTimeout(() => {
          if (contentRef.current) {
            contentRef.current.style.opacity = "1"
            contentRef.current.style.transform = "translateY(0)"
          }
        }, 60)
      }
    }
    setSubTab("")
  }, [activePage])

  const handleNavClick = (id: string) => {
    const item = ALL_NAV_ITEMS.find(i => i.id === id)
    if (item) addOpenPage({ id: item.id, label: item.label })
    setActivePage(id as any)
  }

  const themeVars = {
    "--brand": brandColor, "--brand-rgb": brandRgb,
    "--surface-base": isLight ? "#F2F2F5" : "#121214",
    "--surface-topbar": isLight ? "#FFFFFF" : "#1A1A1E",
    "--surface-raised": isLight ? "#FFFFFF" : "#1E1E22",
    "--sidebar-background": isLight ? "#FFFFFF" : "#1A1A1E",
    "--border-default": isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.08)",
    "--text-primary": isLight ? "#1C1C1E" : "#F2F2F5",
    "--text-secondary": isLight ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.5)",
    "--text-tertiary": isLight ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.25)",
    "--toolbar-bg": isLight ? "rgba(255,255,255,0.8)" : "rgba(26,26,30,0.85)",
    "--toolbar-border": isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)",
    "--toolbar-muted": isLight ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.35)",
  } as React.CSSProperties

  const goHome = () => { const h = ALL_NAV_ITEMS[0]; addOpenPage({ id: h.id, label: h.label }); setActivePage("home" as any) }
  const subTabs = PAGE_SUB_TABS[activePage] || []
  const isRTL = lang === "ar"

  const CollapseIcon = ({ collapsed }: { collapsed: boolean }) => (
    <motion.svg animate={{ rotate: collapsed ? (isRTL ? -180 : 180) : 0 }} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points={isRTL ? "9 18 15 12 9 6" : "15 18 9 12 15 6"} />
    </motion.svg>
  )

  return (
    <div style={{ ...themeVars, backgroundColor: "var(--surface-base)" }} dir={lang === "ar" ? "rtl" : "ltr"} className="h-screen max-h-screen w-screen flex flex-col">
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        background: `radial-gradient(800px circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, ${brandColor}${isLight ? "08" : "10"} 0%, transparent 60%)`,
        transition: "background 0.3s ease",
      }} />

      {/* HEADER */}
      <div className="relative z-[100]">
        <AdminToolbar activePage={activePage} onToggleInspector={() => setInspectorOpen(!inspectorOpen)}
          themeMode={themeMode} onCycleTheme={cycleTheme} effectiveDark={effectiveDark} lang={lang} onToggleLang={toggleLang}
          onLogoClick={goHome} systemTitle={title} themeColor={brandColor} />
      </div>

      {/* SYSTEM TABS */}
      <div className="relative z-10 shrink-0 px-4" style={{ backgroundColor: "var(--surface-topbar)", borderBottom: "1px solid var(--toolbar-border)" }}>
        <div className="flex gap-0.5 overflow-x-auto py-2 scrollbar-none justify-center">
          {SYSTEM_TABS.map(tab => (
            <button key={tab.id} onClick={() => setSystemTab(tab.id)}
              className="flex items-center gap-2 shrink-0 px-4 py-1.5 text-xs font-bold transition-all rounded-lg relative"
              style={{ color: systemTab === tab.id ? brandColor : "var(--text-tertiary)" }}>
              {systemTab === tab.id && <motion.div layoutId="sysTabBg" className="absolute inset-0 rounded-lg" style={{ backgroundColor: isGreen ? "rgba(5,150,105,0.08)" : "rgba(220,38,38,0.08)" }} />}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={systemTab === tab.id ? 2.5 : 1.5}><path d={tab.icon} /></svg>
              {tab.label}
              {systemTab === tab.id && <motion.div layoutId="sysTabDot" className="w-1 h-1 rounded-full" style={{ backgroundColor: brandColor }} />}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative z-10 flex flex-1 min-h-0 overflow-hidden p-2 gap-2">

        {/* SIDEBAR — no group labels */}
        <div className="shrink-0" style={{ width: sidebarCollapsed ? 60 : 210 }}>
          <motion.div animate={{ width: sidebarCollapsed ? 44 : 194 }}
            className="h-full flex flex-col overflow-hidden rounded-2xl border overflow-y-auto scrollbar-none"
            style={{ backgroundColor: "var(--sidebar-background)", borderColor: "var(--border-default)", scrollbarWidth: "none" }}>
            <div className="flex-1 py-2.5 px-1.5 space-y-0.5">
              {ALL_NAV_ITEMS.map(item => {
                const isActive = activePage === item.id
                return (
                  <motion.button key={item.id} onClick={() => handleNavClick(item.id)}
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    className="flex items-center w-full rounded-xl text-xs outline-none relative overflow-hidden transition-all"
                    style={{ padding: sidebarCollapsed ? "10px 8px" : "8px 11px" }}>
                    {isActive ? (
                      <>
                        <motion.div layoutId="navBg" className="absolute inset-0 rounded-xl" style={{ backgroundColor: brandColor }} />
                        <motion.div className="absolute inset-0 rounded-xl" style={{ boxShadow: `inset 0 0 20px rgba(255,255,255,0.15)` }} />
                      </>
                    ) : (
                      <div className="absolute inset-0 rounded-xl hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors" />
                    )}
                    <span className="relative z-10 flex items-center gap-3" style={{
                      color: isActive ? "#FFFFFF" : "var(--text-secondary)",
                      fontWeight: isActive ? 700 : 500,
                    }}>
                      <motion.span animate={isActive ? waveAnim : {}} className="shrink-0 relative flex items-center justify-center w-5 h-5 rounded-full" style={{ backgroundColor: isActive ? "rgba(255,255,255,0.15)" : "transparent" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill={isActive ? "#FFFFFF" : "none"} stroke={isActive ? "#FFFFFF" : "currentColor"} strokeWidth={isActive ? 2.5 : 1.5}>
                          <path d={item.icon} />
                        </svg>
                      </motion.span>
                      {!sidebarCollapsed && <span className="truncate font-bold text-[11px] tracking-wide">{t(lang, item.label)}</span>}
                    </span>
                  </motion.button>
                )
              })}
            </div>
            <motion.button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center py-2.5 shrink-0 mx-1.5 mb-2 rounded-xl"
              style={{ borderTop: "1px solid var(--border-default)", color: "var(--text-tertiary)" }}>
              <CollapseIcon collapsed={sidebarCollapsed} />
            </motion.button>
          </motion.div>
        </div>

          {/* BREADCRUMBS */}
          <div className="shrink-0 px-1">
            <Breadcrumbs />
          </div>

          {/* CONTENT AREA */}
        <div className="flex-1 flex flex-col min-w-0 gap-2">
          {/* FIRST TAB ROW — Open pages from sidebar */}
          <div className="shrink-0 rounded-2xl border px-2" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
            <div className="flex items-center gap-1 overflow-x-auto py-1.5 scrollbar-none">
              {openPages.map(p => {
                const isActive = activePage === p.id
                return (
                  <motion.button key={p.id} onClick={() => setActivePage(p.id as any)}
                    layout layoutId={`tab-${p.id}`}
                    className="flex items-center gap-1.5 shrink-0 px-3 py-1 text-xs font-bold rounded-xl transition-all whitespace-nowrap group"
                    style={{ backgroundColor: isActive ? brandColor : "transparent", color: isActive ? "#FFFFFF" : "var(--text-secondary)" }}>
                    {isActive && <motion.span layoutId="tabActiveDot" className="w-1.5 h-1.5 rounded-full bg-white" />}
                    {p.label}
                    <motion.button
                      onClick={(e) => { e.stopPropagation(); removeOpenPage(p.id) }}
                      whileHover={{ scale: 1.2 }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity ml-0.5"
                      style={{ color: isActive ? "rgba(255,255,255,0.7)" : "var(--text-tertiary)" }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </motion.button>
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* SECOND TAB ROW — Sub-page tabs + location selector */}
          <div className="shrink-0 flex items-center gap-2" style={{ minHeight: 36 }}>
            {subTabs.length > 0 && (
              <div className="flex-1 rounded-2xl border px-3 flex items-center" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
                <div className="flex gap-1 overflow-x-auto py-1.5 scrollbar-none">
                  {subTabs.map(t => (
                    <button key={t.id} onClick={() => setSubTab(t.id)}
                      className="shrink-0 flex items-center gap-1.5 px-3 py-1 text-xs font-bold transition-all rounded-xl whitespace-nowrap"
                      style={{ backgroundColor: subTab === t.id ? brandColor : "transparent", color: subTab === t.id ? "#FFFFFF" : "var(--text-secondary)" }}>
                      {subTab === t.id && <motion.span animate={waveAnim} className="w-1.5 h-1.5 rounded-full bg-white" />}
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {/* Location Selector in right side of second tab row */}
            <LocationSelector />
          </div>

          {/* PAGE CONTENT */}
          <div ref={contentRef} className="flex-1 overflow-y-auto rounded-2xl border p-5 transition-all duration-[60ms]"
            style={{ backgroundColor: "var(--surface-raised)", borderColor: "var(--border-default)" }}>
            <ErrorBoundary>{children}</ErrorBoundary>
          </div>
        </div>

        {/* INSPECTOR */}
        <AnimatePresence>
          {inspectorOpen && (
            <motion.div initial={{ width: 0 }} animate={{ width: 280 }} exit={{ width: 0 }} className="shrink-0 overflow-hidden rounded-2xl border"
              style={{ borderColor: "var(--border-default)" }}>
              <InspectorPanel collapsed={false} onToggleCollapse={() => setInspectorOpen(false)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <CommandPalette />
    </div>
  )
}
