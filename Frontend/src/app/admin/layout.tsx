"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { WorkspaceLayout } from "@/workspace/components/WorkspaceLayout"
import { WorkspaceTabs } from "@/workspace/components/WorkspaceTabs"
import { InspectorPanel } from "@/admin/layout/InspectorPanel"
import { AdminToolbar, AdminStatusBar } from "@/admin/layout/AdminToolbar"
import { useWorkspaceStore } from "@/workspace/stores"

const adminNav = [
  { id: "home", label: "Home", labelAr: "الرئيسية", icon: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" },
  { id: "users", label: "Users", labelAr: "المستخدمين", icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8" },
  { id: "roles", label: "Roles", labelAr: "الأدوار", icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" },
  { id: "audit", label: "Audit", labelAr: "التدقيق", icon: "M9 12l2 2 4-4M7.5 21h9M7.5 21a2.5 2.5 0 01-2.5-2.5V5A2.5 2.5 0 017.5 2.5h9A2.5 2.5 0 0119 5v13.5a2.5 2.5 0 01-2.5 2.5" },
  { id: "customers", label: "Customers", labelAr: "العملاء", icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8" },
  { id: "meters", label: "Meters", labelAr: "العدادات", icon: "M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" },
  { id: "readings", label: "Readings", labelAr: "القراءات", icon: "M9 12l2 2 4-4M7.5 21h9M7.5 21a2.5 2.5 0 01-2.5-2.5V5A2.5 2.5 0 017.5 2.5h9A2.5 2.5 0 0119 5v13.5a2.5 2.5 0 01-2.5 2.5" },
  { id: "invoices", label: "Invoices", labelAr: "الفواتير", icon: "M4 7v10c2 0 3 1 3 3h10c2 0 3-1 3-3V7M4 7h16M9 11h6" },
  { id: "payments", label: "Payments", labelAr: "المدفوعات", icon: "M12 2l7 3v6c0 4.5-3 8.7-7 10-4-1.3-7-5.5-7-10V5l7-3z" },
  { id: "settings", label: "Settings", labelAr: "الإعدادات", icon: "M12 15a3 3 0 100-6 3 3 0 000 6z" },
  { id: "reports", label: "Reports", labelAr: "التقارير", icon: "M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7M4 7h16M9 11h6" },
  { id: "services", label: "Services", labelAr: "الخدمات", icon: "M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" },
  { id: "security", label: "Security", labelAr: "الأمان", icon: "M12 2l7 3v6c0 4.5-3 8.7-7 10-4-1.3-7-5.5-7-10V5l7-3z" },
  { id: "ai", label: "AI", labelAr: "الذكاء", icon: "M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7M4 7h16M9 11h6" },
  { id: "monitoring", label: "Monitor", labelAr: "المراقبة", icon: "M12 2a10 10 0 1010 10M12 12l4-4M12 2v10" },
]

const t = (lang: string, en: string, ar: string) => lang === "ar" ? ar : en

export default function AdminLayout() {
  const [active, setActive] = useState("home")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [inspectorOpen, setInspectorOpen] = useState(false)
  const [inspectorCollapsed, setInspectorCollapsed] = useState(false)
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [themeMode, setThemeMode] = useState<"light" | "dark" | "auto">("auto")
  const [lang, setLang] = useState("en")
  const hour = new Date().getHours()
  const effectiveDark = themeMode === "auto" ? !(hour >= 6 && hour < 18) : themeMode === "dark"
  const cycleTheme = () => setThemeMode(t => t === "auto" ? "light" : t === "light" ? "dark" : "auto")
  const [openTabs, setOpenTabs] = useState<string[]>(["home"])

  // Connect to workspace store for sidebar/inspector sizing
  const wsStore = useWorkspaceStore()
  useEffect(() => { wsStore.setSidebarMode(sidebarCollapsed ? "collapsed" : "expanded") }, [sidebarCollapsed])
  useEffect(() => { wsStore.setInspectorOpen(inspectorOpen) }, [inspectorOpen])

  useEffect(() => {
    if (!openTabs.includes(active)) setOpenTabs(p => [...p, active])
  }, [active])

  const [PageComponent, setPageComponent] = useState<any>(null)
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const mod = await import(`./${active}/page`)
        if (!cancelled) setPageComponent(() => mod.default)
      } catch {
        if (!cancelled) setPageComponent(null)
      }
    }
    load()
    return () => { cancelled = true }
  }, [active])

  const isLight = !effectiveDark
  // Full theme: white bg + dark text + red accent for light mode
  // Full theme: dark bg + light text + red accent for dark mode
  const themeVars = {
    "--brand": "var(--admin-accent)",
    "--brand-rgb": "var(--semantic-error-rgb)",
    "--surface-base": isLight ? "#F8F8F8" : "#0A0A0A",
    "--surface-topbar": isLight ? "#FFFFFF" : "#0D0D0D",
    "--surface-raised": isLight ? "#FFFFFF" : "#0F0F0F",
    "--sidebar-background": isLight ? "#F0F0F0" : "#080808",
    "--border-default": isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.06)",
    "--border-subtle": isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.04)",
    "--text-primary": isLight ? "#1A1A1A" : "#F0F0F0",
    "--text-secondary": isLight ? "rgba(0,0,0,0.65)" : "rgba(255,255,255,0.65)",
    "--text-tertiary": isLight ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.4)",
    "--admin-background": isLight ? "#F8F8F8" : "#0A0A0A",
    "--admin-surface": isLight ? "#FFFFFF" : "#0D0D0D",
    "--admin-border": isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.06)",
    "--admin-text": isLight ? "#1A1A1A" : "#F0F0F0",
    "--toolbar-bg": isLight ? "rgba(255,255,255,0.9)" : "rgba(10,10,10,0.7)",
    "--toolbar-border": isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.06)",
    "--toolbar-text": isLight ? "rgba(0,0,0,0.85)" : "rgba(255,255,255,0.85)",
    "--toolbar-muted": isLight ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.35)",
    "--toolbar-surface": isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.05)",
    "--toolbar-blur": isLight ? "0.6px" : "12px",
  } as React.CSSProperties

  return (
    <div style={themeVars} dir={lang === "ar" ? "rtl" : "ltr"}>
      <WorkspaceLayout
        sidebarContent={
          <div className="flex flex-col h-full relative">
            <div className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
              {adminNav.map((item) => {
                const isActive = active === item.id
                return (
                  <motion.button key={item.id} onClick={() => setActive(item.id)}
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className="flex items-center justify-center w-full rounded-lg text-xs outline-none"
                    style={{ padding: "8px", backgroundColor: isActive ? "var(--admin-accent)" : "transparent", color: isActive ? "white" : "var(--text-tertiary)", border: "none", cursor: "pointer" }}
                    title={sidebarCollapsed ? t(lang, item.label, item.labelAr) : undefined}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                      <path d={item.icon} />
                    </svg>
                    {!sidebarCollapsed && <span className="ml-2.5 mr-2.5 text-xs truncate">{t(lang, item.label, item.labelAr)}</span>}
                  </motion.button>
                )
              })}
            </div>
            <motion.button onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}
              className="flex items-center justify-center w-full py-2.5 outline-none"
              style={{ borderTop: "1px solid var(--border-default)", color: "var(--text-tertiary)", cursor: "pointer", background: "transparent", borderLeft: "none", borderRight: "none", borderBottom: "none" }}>
              <motion.div animate={{ rotate: sidebarCollapsed ? 180 : 0 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
              </motion.div>
            </motion.button>
          </div>
        }
        toolbarContent={<AdminToolbar activePage={active} onToggleInspector={() => setInspectorOpen(!inspectorOpen)} themeMode={themeMode} onCycleTheme={cycleTheme} effectiveDark={effectiveDark} lang={lang} onToggleLang={() => setLang(l => l === "en" ? "ar" : "en")} />}
        tabBar={<WorkspaceTabs />}
        statusBar={<AdminStatusBar inspectorOpen={inspectorOpen} onToggleInspector={() => setInspectorOpen(!inspectorOpen)} lang={lang} />}
        inspectorContent={inspectorOpen ? <InspectorPanel collapsed={inspectorCollapsed} onToggleCollapse={() => setInspectorCollapsed(!inspectorCollapsed)} /> : undefined}
      >
        <div className="h-full">
          <div className="flex items-center gap-2 p-3 border-b" style={{ borderColor: "var(--border-default)" }}>
            <input placeholder={t(lang, "Search admin...", "بحث في الإدارة...")} className="flex-1 px-3 py-1.5 rounded-lg text-xs outline-none" style={{ backgroundColor: "var(--toolbar-surface)", border: "1px solid var(--toolbar-border)", color: "var(--toolbar-text)" }} />
            <button onClick={() => setViewMode("list")} className="px-2 py-1 rounded text-xs" style={{ backgroundColor: viewMode === "list" ? "var(--admin-accent)" : "var(--toolbar-surface)", color: viewMode === "list" ? "white" : "var(--toolbar-muted)" }}>{t(lang, "List", "قائمة")}</button>
            <button onClick={() => setViewMode("grid")} className="px-2 py-1 rounded text-xs" style={{ backgroundColor: viewMode === "grid" ? "var(--admin-accent)" : "var(--toolbar-surface)", color: viewMode === "grid" ? "white" : "var(--toolbar-muted)" }}>{t(lang, "Grid", "شبكة")}</button>
          </div>
          {PageComponent && <PageComponent viewMode={viewMode} lang={lang} />}
        </div>
      </WorkspaceLayout>
    </div>
  )
}
