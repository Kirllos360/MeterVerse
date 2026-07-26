"use client"

import { motion } from "framer-motion"
import { ErrorBoundary } from "@/components/effects/ErrorBoundary"
import { InspectorPanel } from "@/admin/layout/InspectorPanel"
import { AdminToolbar, AdminStatusBar } from "@/admin/layout/AdminToolbar"
import { useAdminStore } from "@/stores/admin-store"

const adminNav = [
  { id: "home", label: "Home", labelAr: "الرئيسية", icon: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" },
  { id: "users", label: "Users", labelAr: "المستخدمين", icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8" },
  { id: "roles", label: "Roles", labelAr: "الأدوار", icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" },
  { id: "audit", label: "Audit", labelAr: "التدقيق", icon: "M9 12l2 2 4-4M7.5 21h9M7.5 21a2.5 2.5 0 01-2.5-2.5V5A2.5 2.5 0 017.5 2.5h9A2.5 2.5 0 0119 5v13.5a2.5 2.5 0 01-2.5 2.5" },
  { id: "customers", label: "Customers", labelAr: "العملاء", icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8" },
  { id: "meters", label: "Meters", labelAr: "العدادات", icon: "M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" },
  { id: "meters-relay", label: "Meter Relay", labelAr: "مرحل العداد", icon: "M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" },
  { id: "meter-assignments", label: "Meter Assign", labelAr: "تعيين العداد", icon: "M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" },
  { id: "projects", label: "Projects", labelAr: "المشاريع", icon: "M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" },
  { id: "zones", label: "Zones", labelAr: "المناطق", icon: "M9 12l2 2 4-4M7.5 21h9M7.5 21a2.5 2.5 0 01-2.5-2.5V5A2.5 2.5 0 0119 5v13.5a2.5 2.5 0 01-2.5 2.5" },
  { id: "units", label: "Units", labelAr: "الوحدات", icon: "M4 7v10c2 0 3 1 3 3h10c2 0 3-1 3-3V7M4 7h16M9 11h6" },
  { id: "readings", label: "Readings", labelAr: "القراءات", icon: "M9 12l2 2 4-4M7.5 21h9M7.5 21a2.5 2.5 0 01-2.5-2.5V5A2.5 2.5 0 0119 5v13.5a2.5 2.5 0 01-2.5 2.5" },
  { id: "consumption", label: "Consumption", labelAr: "الاستهلاك", icon: "M9 12l2 2 4-4M7.5 21h9M7.5 21a2.5 2.5 0 01-2.5-2.5V5A2.5 2.5 0 0119 5v13.5a2.5 2.5 0 01-2.5 2.5" },
  { id: "batch-validation", label: "Batch Valid.", labelAr: "التحقق الدفعي", icon: "M9 12l2 2 4-4M7.5 21h9M7.5 21a2.5 2.5 0 01-2.5-2.5V5A2.5 2.5 0 0119 5v13.5a2.5 2.5 0 01-2.5 2.5" },
  { id: "invoices", label: "Invoices", labelAr: "الفواتير", icon: "M4 7v10c2 0 3 1 3 3h10c2 0 3-1 3-3V7M4 7h16M9 11h6" },
  { id: "payments", label: "Payments", labelAr: "المدفوعات", icon: "M12 2l7 3v6c0 4.5-3 8.7-7 10-4-1.3-7-5.5-7-10V5l7-3z" },
  { id: "tariffs", label: "Tariffs", labelAr: "التعرفة", icon: "M12 2l7 3v6c0 4.5-3 8.7-7 10-4-1.3-7-5.5-7-10V5l7-3z" },
  { id: "sim", label: "SIM Cards", labelAr: "بطاقات SIM", icon: "M4 7v10c2 0 3 1 3 3h10c2 0 3-1 3-3V7M4 7h16M9 11h6" },
  { id: "settings", label: "Settings", labelAr: "الإعدادات", icon: "M12 15a3 3 0 100-6 3 3 0 000 6z" },
  { id: "reports", label: "Reports", labelAr: "التقارير", icon: "M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7M4 7h16M9 11h6" },
  { id: "services", label: "Services", labelAr: "الخدمات", icon: "M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" },
  { id: "security", label: "Security", labelAr: "الأمان", icon: "M12 2l7 3v6c0 4.5-3 8.7-7 10-4-1.3-7-5.5-7-10V5l7-3z" },
  { id: "ai", label: "AI", labelAr: "الذكاء", icon: "M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7M4 7h16M9 11h6" },
  { id: "ai-command-center", label: "AI Cmd Center", labelAr: "مركز القيادة", icon: "M12 2l7 3v6c0 4.5-3 8.7-7 10-4-1.3-7-5.5-7-10V5l7-3z" },
  { id: "monitoring", label: "Monitor", labelAr: "المراقبة", icon: "M12 2a10 10 0 1010 10M12 12l4-4M12 2v10" },
  { id: "config-center", label: "Config", labelAr: "الإعدادات", icon: "M12 15a3 3 0 100-6 3 3 0 000 6z" },
]

const t = (lang: string, en: string, ar: string) => lang === "ar" ? ar : en

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { activePage, setActivePage, inspectorOpen, setInspectorOpen, sidebarCollapsed, setSidebarCollapsed, themeMode, cycleTheme, lang, toggleLang } = useAdminStore()
  const hour = new Date().getHours()
  const effectiveDark = themeMode === "auto" ? !(hour >= 6 && hour < 18) : themeMode === "dark"
  const isLight = !effectiveDark
  const themeVars = {
    "--brand": "#DC2626", "--brand-rgb": "220,38,38",
    "--surface-base": isLight ? "#F8F8F8" : "#0A0A0A",
    "--surface-topbar": isLight ? "#FFFFFF" : "#0D0D0D",
    "--surface-raised": isLight ? "#FFFFFF" : "#0F0F0F",
    "--sidebar-background": isLight ? "#F0F0F0" : "#080808",
    "--border-default": isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.06)",
    "--text-primary": isLight ? "#1A1A1A" : "#F0F0F0",
    "--text-secondary": isLight ? "rgba(0,0,0,0.65)" : "rgba(255,255,255,0.65)",
    "--text-tertiary": isLight ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.4)",
    "--toolbar-bg": isLight ? "rgba(255,255,255,0.9)" : "rgba(10,10,10,0.7)",
    "--toolbar-border": isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.06)",
    "--toolbar-text": isLight ? "rgba(0,0,0,0.85)" : "rgba(255,255,255,0.85)",
    "--toolbar-muted": isLight ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.35)",
    "--toolbar-surface": isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.05)",
  } as React.CSSProperties

  return (
    <div style={{ ...themeVars, backgroundColor: "var(--surface-base)" }} dir={lang === "ar" ? "rtl" : "ltr"} className="h-screen w-screen overflow-hidden flex flex-col">
      {/* Toolbar */}
      <AdminToolbar activePage={activePage} onToggleInspector={() => setInspectorOpen(!inspectorOpen)} themeMode={themeMode} onCycleTheme={cycleTheme} effectiveDark={effectiveDark} lang={lang} onToggleLang={toggleLang} />
      
      {/* Main content area */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Sidebar */}
        <motion.div animate={{ width: sidebarCollapsed ? 60 : 200 }} className="shrink-0 flex flex-col" style={{ backgroundColor: "var(--sidebar-background)", borderRight: "1px solid var(--border-default)" }}>
          <div className="flex-1 overflow-y-auto py-2 px-1.5 space-y-0.5">
            {adminNav.map((item) => {
              const isActive = activePage === item.id
              return (
                <motion.button key={item.id} onClick={() => setActivePage(item.id as any)}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="flex items-center w-full rounded-lg text-xs outline-none transition-colors"
                  style={{ padding: sidebarCollapsed ? "10px 8px" : "8px 10px", backgroundColor: isActive ? "var(--brand)" : "transparent", color: isActive ? "white" : "var(--text-tertiary)" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0"><path d={item.icon} /></svg>
                  {!sidebarCollapsed && <span className="ml-2.5 truncate">{t(lang, item.label, item.labelAr)}</span>}
                </motion.button>
              )
            })}
          </div>
          <motion.button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="flex items-center justify-center py-2.5" style={{ borderTop: "1px solid var(--border-default)", color: "var(--text-tertiary)" }}>
            <motion.svg animate={{ rotate: sidebarCollapsed ? 180 : 0 }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></motion.svg>
          </motion.button>
        </motion.div>

        {/* Content area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto">
            {children ? <ErrorBoundary>{children}</ErrorBoundary> : null}
          </div>
          <AdminStatusBar inspectorOpen={inspectorOpen} onToggleInspector={() => setInspectorOpen(!inspectorOpen)} lang={lang} />
        </div>

        {/* Inspector panel */}
        {inspectorOpen && <InspectorPanel collapsed={false} onToggleCollapse={() => setInspectorOpen(false)} />}
      </div>
    </div>
  )
}


