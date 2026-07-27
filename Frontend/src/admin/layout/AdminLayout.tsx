"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ErrorBoundary } from "@/components/effects/ErrorBoundary"
import { InspectorPanel } from "@/admin/layout/InspectorPanel"
import { AdminToolbar } from "@/admin/layout/AdminToolbar"
import { useAdminStore } from "@/stores/admin-store"

const SYSTEM_TABS = [
  { id: "admin", label: "Admin", icon: "M12 15V3m0 12l-4-4m4 4l4-4" },
  { id: "dashboard", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7" },
  { id: "analytics", label: "Analytics", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2z" },
  { id: "system", label: "System", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0" },
]

const ADMIN_ONLY_IDS = [
    "roles","users", "settings", "tariffs", "audit", "monitoring", "projects", "zones", "database", "areas", "promotions", "api-management", "readings"]
const USER_ONLY_IDS = ["accounting", "workspace", "upload", "add-data", "tracking", "sim-cards", "tickets", "info-guide"]

const ALL_NAV_GROUPS = [
  { label: "Main", items: [
    { id: "home", label: "Home", icon: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" },
    { id: "customers", label: "Customers", icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8" },
    { id: "meters", label: "Meters", icon: "M9 3l3-3m0 0l3 3m-3-3v12" },
    { id: "projects", label: "Projects", icon: "M4 8V4m0 0h4M4 4l5 5" },
    { id: "database", label: "Database", icon: "M4 7v10c0 2 1.5 4 4 4h8c2.5 0 4-2 4-4V7c0-2-1.5-4-4-4H8c-2.5 0-4 2-4 4z" },
    { id: "readings", label: "Readings", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  ]},
  { label: "Workspace", items: [
    { id: "workspace", label: "Workspace", icon: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" },
    { id: "upload", label: "Upload Center", icon: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5m0 0L7 8m5-5v12" },
    { id: "add-data", label: "Add Data", icon: "M12 4v16m8-8H4" },
    { id: "tracking", label: "Tracking", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
  ]},
  { label: "Support", items: [
    { id: "sim-cards", label: "SIM Cards", icon: "M9 3v2m6-2v2M9 7h6M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
    { id: "tickets", label: "Tickets", icon: "M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" },
    { id: "info-guide", label: "Info & Guide", icon: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  ]},
  { label: "Location", items: [
    { id: "zones", label: "Zones", icon: "M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    { id: "units", label: "Units", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16" },
    { id: "areas", label: "Areas", icon: "M21 12a9 9 0 11-18 0 9 9 0 0118 0zM3.6 9h16.8M3.6 15h16.8" },
  ]},
  { label: "Billing", items: [
    { id: "invoices", label: "Invoices", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586" },
    { id: "payments", label: "Payments", icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2" },
    { id: "tariffs", label: "Tariffs", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
  ]},
  { label: "System", items: [
    { id: "users", label: "Users", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1z" },
    { id: "settings", label: "Settings", icon: "M12 15a3 3 0 100-6 3 3 0 000 6z" },
    { id: "accounting", label: "Accounting", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
    { id: "reports", label: "Reports", icon: "M9 17v-2m3 2v-4m3 4v-6" },
    { id: "monitoring", label: "Monitor", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2z" },
    { id: "roles", label: "Roles", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944" },
    { id: "audit", label: "Audit", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" },
    { id: "promotions", label: "Promotions", icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" },
    { id: "api-management", label: "API Management", icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" },
  ]},
]

const PAGE_SUB_TABS: Record<string, { id: string; label: string }[]> = {
  meters: [{ id: "", label: "Dashboard" }, { id: "relay", label: "Relay" }, { id: "meter-assignments", label: "Assign" }, { id: "sim", label: "SIM" }, { id: "readings", label: "Readings" }],
  customers: [{ id: "", label: "Dashboard" }, { id: "groups", label: "Groups" }, { id: "config", label: "Config" }],
  invoices: [{ id: "", label: "Dashboard" }, { id: "analytics", label: "Analytics" }, { id: "settings", label: "Settings" }],
  settings: [{ id: "", label: "General" }, { id: "security", label: "Security" }, { id: "notifications", label: "Notifications" }],
  monitoring: [{ id: "", label: "Dashboard" }, { id: "events", label: "Events" }, { id: "logs", label: "Logs" }, { id: "apis", label: "APIs" }],
  accounting: [{ id: "", label: "Dashboard" }, { id: "accounts", label: "Accounts" }, { id: "journal", label: "Journal" }, { id: "ledger", label: "Ledger" }, { id: "trial-balance", label: "Trial Balance" }],
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

  const { activePage, setActivePage, inspectorOpen, setInspectorOpen, sidebarCollapsed, setSidebarCollapsed, themeMode, cycleTheme, lang, toggleLang } = useAdminStore()
  const [systemTab, setSystemTab] = useState("admin")
  const [subTab, setSubTab] = useState("")
  const [prevPage, setPrevPage] = useState("")
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
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
    "--toolbar-border": isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.08)",
    "--toolbar-text": isLight ? "#1C1C1E" : "#F2F2F5",
    "--toolbar-muted": isLight ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.25)",
    "--toolbar-surface": isLight ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.04)",
    "--admin-surface": isLight ? "#F2F2F5" : "#222226",
    "--admin-border": isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.08)",
    "--admin-accent": brandColor,
    "--primary": brandColor,
    "--primary-foreground": "#FFFFFF",
  } as React.CSSProperties

  const navGroups = ALL_NAV_GROUPS.map(group => ({
    ...group,
    items: group.items.filter(item =>
      isGreen ? !ADMIN_ONLY_IDS.includes(item.id) : !USER_ONLY_IDS.includes(item.id)
    ),
  })).filter(group => group.items.length > 0)

  const goHome = () => setActivePage("home" as any)
  const subTabs = PAGE_SUB_TABS[activePage] || []
  const isRTL = lang === "ar"
  const CollapseIcon = ({ collapsed }: { collapsed: boolean }) => (
    <motion.svg animate={{ rotate: collapsed ? (isRTL ? -180 : 180) : 0 }} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points={isRTL ? "9 18 15 12 9 6" : "15 18 9 12 15 6"} />
    </motion.svg>
  )

  return (
    <div style={{ ...themeVars, backgroundColor: "var(--surface-base)" }} dir={lang === "ar" ? "rtl" : "ltr"} className="h-screen max-h-screen w-screen flex flex-col">
      
      {/* Mouse-following gradient */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        background: `radial-gradient(800px circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, ${brandColor}${isLight ? "08" : "10"} 0%, transparent 60%)`,
        transition: "background 0.3s ease",
      }} />

      {/* HEADER — high z-index so dropdowns appear above everything */}
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

        {/* SIDEBAR */}
        <div className="shrink-0" style={{ width: sidebarCollapsed ? 60 : 210 }}>
          <motion.div animate={{ width: sidebarCollapsed ? 44 : 194 }}
            className="h-full flex flex-col overflow-hidden rounded-2xl border overflow-y-auto scrollbar-none"
            style={{ backgroundColor: "var(--sidebar-background)", borderColor: "var(--border-default)", scrollbarWidth: "none" }}>
            
            <div className="flex-1 py-2.5 px-1.5 space-y-3">
              {navGroups.map(group => (
                <div key={group.label}>
                  {!sidebarCollapsed && <p className="text-[9px] font-bold uppercase tracking-[0.15em] px-2.5 mb-1.5" style={{ color: "var(--text-tertiary)" }}>{group.label}</p>}
                  {group.items.map(item => {
                    const isActive = activePage === item.id
                    return (
                      <motion.button key={item.id} onClick={() => setActivePage(item.id as any)}
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
              ))}
            </div>

            <motion.button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center py-2.5 shrink-0 mx-1.5 mb-2 rounded-xl"
              style={{ borderTop: "1px solid var(--border-default)", color: "var(--text-tertiary)" }}>
              <CollapseIcon collapsed={sidebarCollapsed} />
            </motion.button>
          </motion.div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 flex flex-col min-w-0 gap-2">
          {subTabs.length > 0 && (
            <div className="shrink-0 rounded-2xl border px-4 flex justify-center" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
              <div className="flex gap-1 overflow-x-auto py-2 scrollbar-none">
                {subTabs.map(t => (
                  <button key={t.id} onClick={() => setSubTab(t.id)}
                    className="shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold transition-all rounded-xl whitespace-nowrap"
                    style={{ backgroundColor: subTab === t.id ? brandColor : "transparent", color: subTab === t.id ? "#FFFFFF" : "var(--text-secondary)" }}>
                    {subTab === t.id && <motion.span animate={waveAnim} className="w-1.5 h-1.5 rounded-full bg-white" />}
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-[1px] scrollbar-thin">
            <motion.div ref={contentRef}
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
              className="h-full rounded-2xl border p-5 overflow-y-auto content-panel"
              style={{
                backgroundColor: "var(--surface-raised)",
                borderColor: isLight ? "var(--border-default)" : `${brandColor}33`,
                boxShadow: isLight ? "none" : `inset 0 0 60px ${brandColor}08`,
              }}>
              {children ? <ErrorBoundary>{children}</ErrorBoundary> : null}
            </motion.div>
          </div>
        </div>

        {/* INSPECTOR */}
        <motion.div className="shrink-0" animate={{ width: inspectorOpen ? 360 : 52 }} style={{ overflow: "visible" }}>
          <InspectorPanel collapsed={!inspectorOpen} onToggleCollapse={() => setInspectorOpen(!inspectorOpen)} />
        </motion.div>
      </div>

      {/* FOOTER */}
      <div className="relative z-10 shrink-0 flex items-center" style={{ height: 40, backgroundColor: "var(--surface-topbar)", borderTop: "1px solid var(--border-default)" }}>
        <div className="flex items-center justify-between w-full px-5 text-[12px] font-bold tracking-wide" style={{ color: "var(--text-secondary)" }}>
          <div className="flex items-center gap-3">
            <motion.div animate={waveAnim} className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: brandColor }} />
            <span className="font-extrabold tracking-wider" style={{ color: "var(--text-secondary)", fontSize: "13px" }}>Meter Verse v8.0</span>
            <span className="hidden sm:inline opacity-50">·</span>
            <span className="hidden sm:inline opacity-70">{isLight ? "Light" : "Dark"} · {lang.toUpperCase()}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: brandColor }} /> All Systems Normal</span>
            <span className="w-px h-3" style={{ backgroundColor: "var(--border-default)" }} />
            <motion.span animate={waveAnim} className="w-2 h-2 rounded-full" style={{ backgroundColor: brandColor }} />
          </div>
        </div>
      </div>
    </div>
  )
}





