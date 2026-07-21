"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { WorkspaceLayout } from "@/workspace/components/WorkspaceLayout"
import { WorkspaceTabs } from "@/workspace/components/WorkspaceTabs"
import { InspectorPanel } from "@/admin/layout/InspectorPanel"
import { AdminToolbar, AdminStatusBar } from "@/admin/layout/AdminToolbar"

import AdminHomePage from "./home/page"
import AdminUsersPage from "./users/page"
import AdminRolesPage from "./roles/page"
import AdminAuditPage from "./audit/page"
import AdminCustomersPage from "./customers/page"
import AdminSettingsPage from "./settings/page"
import AdminReportsPage from "./reports/page"
import AdminServicesPage from "./services/page"
import AdminSecurityPage from "./security/page"
import AdminAIPage from "./ai/page"
import AdminMonitoringPage from "./monitoring/page"

const adminNav = [
  { id: "home", label: "Home", icon: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z", comp: "AdminHomePage" },
  { id: "users", label: "Users", icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8", comp: "AdminUsersPage" },
  { id: "roles", label: "Roles", icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", comp: "AdminRolesPage" },
  { id: "audit", label: "Audit", icon: "M9 12l2 2 4-4M7.5 21h9M7.5 21a2.5 2.5 0 01-2.5-2.5V5A2.5 2.5 0 017.5 2.5h9A2.5 2.5 0 0119 5v13.5a2.5 2.5 0 01-2.5 2.5", comp: "AdminAuditPage" },
  { id: "customers", label: "Customers", icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8", comp: "AdminCustomersPage" },
  { id: "settings", label: "Settings", icon: "M12 15a3 3 0 100-6 3 3 0 000 6z", comp: "AdminSettingsPage" },
  { id: "reports", label: "Reports", icon: "M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7M4 7h16M9 11h6", comp: "AdminReportsPage" },
  { id: "services", label: "Services", icon: "M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4", comp: "AdminServicesPage" },
  { id: "security", label: "Security", icon: "M12 2l7 3v6c0 4.5-3 8.7-7 10-4-1.3-7-5.5-7-10V5l7-3z", comp: "AdminSecurityPage" },
  { id: "ai", label: "AI", icon: "M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7M4 7h16M9 11h6", comp: "AdminAIPage" },
  { id: "monitoring", label: "Monitor", icon: "M12 2a10 10 0 1010 10M12 12l4-4M12 2v10", comp: "AdminMonitoringPage" },
]

const pageComponents: Record<string, any> = {
  AdminHomePage, AdminUsersPage, AdminRolesPage, AdminAuditPage,
  AdminCustomersPage, AdminSettingsPage, AdminReportsPage, AdminServicesPage,
  AdminSecurityPage, AdminAIPage, AdminMonitoringPage,
}

export default function AdminLayout() {
  const [active, setActive] = useState("home")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [inspectorOpen, setInspectorOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [themeMode, setThemeMode] = useState<"light" | "dark" | "auto">("auto")
  const hour = new Date().getHours()
  const effectiveDark = themeMode === "auto" ? !(hour >= 6 && hour < 18) : themeMode === "dark"
  const cycleTheme = () => setThemeMode(t => t === "auto" ? "light" : t === "light" ? "dark" : "auto")
  const [openTabs, setOpenTabs] = useState<string[]>(["home"])

  useEffect(() => {
    if (!openTabs.includes(active)) setOpenTabs(p => [...p, active])
  }, [active])

  const navItem = adminNav.find(n => n.id === active)
  const PageComponent = navItem ? pageComponents[navItem.comp] : AdminHomePage

  return (
    <div style={{
      "--brand": "var(--admin-accent)",
      "--brand-rgb": "var(--semantic-error-rgb)",
      "--toolbar-bg": effectiveDark ? "rgba(10,10,10,0.7)" : "rgba(255,255,255,0.85)",
      "--toolbar-border": effectiveDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)",
      "--toolbar-text": effectiveDark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.85)",
      "--toolbar-muted": effectiveDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.4)",
      "--toolbar-surface": effectiveDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
    } as React.CSSProperties}>
      <WorkspaceLayout
        sidebarContent={
          <div className="flex flex-col h-full relative" style={{ width: sidebarCollapsed ? 72 : "100%" }}>
            {/* Nav items — no logo, just icons */}
            <div className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
              {adminNav.map((item) => {
                const isActive = active === item.id
                return (
                  <motion.button key={item.id} onClick={() => setActive(item.id)}
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className="flex items-center justify-center w-full rounded-lg text-xs outline-none"
                    style={{ padding: "8px", backgroundColor: isActive ? "var(--admin-accent)" : "transparent", color: isActive ? "white" : "var(--text-tertiary)", border: "none", cursor: "pointer" }}
                    title={sidebarCollapsed ? item.label : undefined}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                      <path d={item.icon} />
                    </svg>
                    {!sidebarCollapsed && <span className="ml-2.5 text-xs truncate">{item.label}</span>}
                  </motion.button>
                )
              })}
            </div>

            {/* Collapse button */}
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
        toolbarContent={<AdminToolbar activePage={active} viewMode={viewMode} onViewModeChange={setViewMode} onToggleInspector={() => setInspectorOpen(!inspectorOpen)} themeMode={themeMode} onCycleTheme={cycleTheme} effectiveDark={effectiveDark} />}
        tabBar={<WorkspaceTabs />}
        statusBar={<AdminStatusBar inspectorOpen={inspectorOpen} onToggleInspector={() => setInspectorOpen(!inspectorOpen)} />}
        inspectorContent={inspectorOpen ? <InspectorPanel /> : undefined}
      >
        <div className="h-full">
          {PageComponent && <PageComponent viewMode={viewMode} />}
        </div>
      </WorkspaceLayout>
    </div>
  )
}
