"use client"

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
    { id: "meters", label: "Meters", icon: "M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" },
    { id: "meters-relay", label: "Relay", icon: "M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" },
    { id: "meter-assignments", label: "Assign", icon: "M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" },
    { id: "sim", label: "SIM Cards", icon: "M4 7v10c2 0 3 1 3 3h10c2 0 3-1 3-3V7M4 7h16M9 11h6" },
    { id: "readings", label: "Readings", icon: "M9 12l2 2 4-4M7.5 21h9M7.5 21a2.5 2.5 0 01-2.5-2.5V5A2.5 2.5 0 0119 5v13.5a2.5 2.5 0 01-2.5 2.5" },
    { id: "batch-validation", label: "Validate", icon: "M9 12l2 2 4-4M7.5 21h9M7.5 21a2.5 2.5 0 01-2.5-2.5V5A2.5 2.5 0 0119 5v13.5a2.5 2.5 0 01-2.5 2.5" },
  ]},
  { label: "Location", items: [
    { id: "zones", label: "Zones", icon: "M9 12l2 2 4-4M7.5 21h9M7.5 21a2.5 2.5 0 01-2.5-2.5V5A2.5 2.5 0 0119 5v13.5a2.5 2.5 0 01-2.5 2.5" },
    { id: "units", label: "Units", icon: "M4 7v10c2 0 3 1 3 3h10c2 0 3-1 3-3V7M4 7h16M9 11h6" },
  ]},
  { label: "Billing", items: [
    { id: "invoices", label: "Invoices", icon: "M4 7v10c2 0 3 1 3 3h10c2 0 3-1 3-3V7M4 7h16M9 11h6" },
    { id: "payments", label: "Payments", icon: "M12 2l7 3v6c0 4.5-3 8.7-7 10-4-1.3-7-5.5-7-10V5l7-3z" },
    { id: "tariffs", label: "Tariffs", icon: "M12 2l7 3v6c0 4.5-3 8.7-7 10-4-1.3-7-5.5-7-10V5l7-3z" },
    { id: "consumption", label: "Consumption", icon: "M9 12l2 2 4-4M7.5 21h9M7.5 21a2.5 2.5 0 01-2.5-2.5V5A2.5 2.5 0 0119 5v13.5a2.5 2.5 0 01-2.5 2.5" },
  ]},
  { label: "Intelligence", items: [
    { id: "ai-command-center", label: "AI Cmd", icon: "M12 2l7 3v6c0 4.5-3 8.7-7 10-4-1.3-7-5.5-7-10V5l7-3z" },
    { id: "ai-operations", label: "AI Ops", icon: "M12 2l7 3v6c0 4.5-3 8.7-7 10-4-1.3-7-5.5-7-10V5l7-3z" },
    { id: "rca-workspace", label: "RCA", icon: "M12 2l7 3v6c0 4.5-3 8.7-7 10-4-1.3-7-5.5-7-10V5l7-3z" },
  ]},
  { label: "System", items: [
    { id: "users", label: "Users", icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8" },
    { id: "roles", label: "Roles", icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" },
    { id: "audit", label: "Audit", icon: "M9 12l2 2 4-4M7.5 21h9M7.5 21a2.5 2.5 0 01-2.5-2.5V5A2.5 2.5 0 017.5 2.5h9A2.5 2.5 0 0119 5v13.5a2.5 2.5 0 01-2.5 2.5" },
    { id: "settings", label: "Settings", icon: "M12 15a3 3 0 100-6 3 3 0 000 6z" },
    { id: "reports", label: "Reports", icon: "M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7M4 7h16M9 11h6" },
    { id: "monitoring", label: "Monitor", icon: "M12 2a10 10 0 1010 10M12 12l4-4M12 2v10" },
  ]},
]

const t = (lang: string, en: string, ar?: string) => lang === "ar" && ar ? ar : en

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { activePage, setActivePage, inspectorOpen, setInspectorOpen, sidebarCollapsed, setSidebarCollapsed, themeMode, cycleTheme, lang, toggleLang } = useAdminStore()
  const hour = new Date().getHours()
  const effectiveDark = themeMode === "auto" ? !(hour >= 6 && hour < 18) : themeMode === "dark"
  const isLight = !effectiveDark
  const themeVars = {
    "--brand": "#00BFA5", "--brand-rgb": "0,191,165",
    "--surface-base": isLight ? "#F8FAFC" : "#0B1120",
    "--surface-topbar": isLight ? "#FFFFFF" : "#0F1729",
    "--surface-raised": isLight ? "#FFFFFF" : "#1A2332",
    "--sidebar-background": isLight ? "#0F172A" : "#080E1A",
    "--border-default": isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)",
    "--text-primary": isLight ? "#0F172A" : "#F1F5F9",
    "--text-secondary": isLight ? "rgba(15,23,42,0.6)" : "rgba(241,245,249,0.6)",
    "--text-tertiary": isLight ? "rgba(15,23,42,0.35)" : "rgba(241,245,249,0.35)",
    "--toolbar-bg": isLight ? "rgba(255,255,255,0.85)" : "rgba(15,23,41,0.85)",
    "--toolbar-border": isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)",
    "--toolbar-text": isLight ? "#0F172A" : "#F1F5F9",
    "--toolbar-muted": isLight ? "rgba(15,23,42,0.35)" : "rgba(241,245,249,0.35)",
    "--toolbar-surface": isLight ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.04)",
  } as React.CSSProperties

  return (
    <div style={{ ...themeVars, backgroundColor: "var(--surface-base)" }} dir={lang === "ar" ? "rtl" : "ltr"} className="h-screen w-screen overflow-hidden flex flex-col">
      <AdminToolbar activePage={activePage} onToggleInspector={() => setInspectorOpen(!inspectorOpen)} themeMode={themeMode} onCycleTheme={cycleTheme} effectiveDark={effectiveDark} lang={lang} onToggleLang={toggleLang} />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Sidebar — n8n-style dark palette */}
        <motion.div animate={{ width: sidebarCollapsed ? 56 : 220 }} className="shrink-0 flex flex-col overflow-hidden" style={{ backgroundColor: "var(--sidebar-background)", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex-1 overflow-y-auto py-4 px-2.5 space-y-5 scrollbar-thin">
            {navGroups.map(group => (
              <div key={group.label}>
                {!sidebarCollapsed && <p className="text-[9px] font-semibold uppercase tracking-[0.12em] px-2.5 mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>{group.label}</p>}
                <div className="space-y-0.5">
                  {group.items.map(item => {
                    const isActive = activePage === item.id
                    return (
                      <motion.button key={item.id} onClick={() => setActivePage(item.id as any)}
                        className="flex items-center w-full rounded-md text-xs outline-none relative"
                        style={{ padding: sidebarCollapsed ? "9px 7px" : "6px 10px", color: isActive ? "#FFFFFF" : "rgba(255,255,255,0.45)" }}>
                        {isActive && <motion.div layoutId="activeNav" className="absolute left-0 top-0.5 bottom-0.5 w-0.5 rounded-full" style={{ backgroundColor: "var(--brand)" }} />}
                        <motion.div className="absolute inset-0 rounded-md" initial={false} animate={{ backgroundColor: isActive ? "rgba(255,255,255,0.08)" : "transparent" }} transition={{ duration: 0.15 }} />
                        {!isActive && <div className="absolute inset-0 rounded-md hover:bg-white/[0.04] transition-colors" />}
                        <span className="relative z-10 flex items-center gap-2.5">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0"><path d={item.icon} /></svg>
                          {!sidebarCollapsed && <span className="truncate text-[11px] font-medium">{t(lang, item.label)}</span>}
                        </span>
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
          <motion.button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="flex items-center justify-center py-2.5 shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)" }}>
            <motion.svg animate={{ rotate: sidebarCollapsed ? 180 : 0 }} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></motion.svg>
          </motion.button>
        </motion.div>

        {/* Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {children ? <ErrorBoundary>{children}</ErrorBoundary> : null}
            </div>
          </div>
          <AdminStatusBar inspectorOpen={inspectorOpen} onToggleInspector={() => setInspectorOpen(!inspectorOpen)} lang={lang} />
        </div>

        {/* Inspector */}
        {inspectorOpen && <InspectorPanel collapsed={false} onToggleCollapse={() => setInspectorOpen(false)} />}
      </div>
    </div>
  )
}
