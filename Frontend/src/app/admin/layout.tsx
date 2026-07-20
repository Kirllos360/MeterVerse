"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { WorkspaceLayout } from "@/workspace/components/WorkspaceLayout"
import { WorkspaceTabs } from "@/workspace/components/WorkspaceTabs"
import { InspectorPanel } from "@/admin/layout/InspectorPanel"

// Lazy page imports
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
  const [openTabs, setOpenTabs] = useState<string[]>(["home"])

  useEffect(() => {
    if (!openTabs.includes(active)) setOpenTabs(p => [...p, active])
  }, [active])

  const navItem = adminNav.find(n => n.id === active)
  const PageComponent = navItem ? pageComponents[navItem.comp] : AdminHomePage

  return (
    <div style={{ "--brand": "var(--admin-accent)", "--brand-rgb": "var(--semantic-error-rgb)" } as React.CSSProperties}>
      <WorkspaceLayout
      sidebarContent={
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 px-3 h-12 shrink-0 border-b" style={{ borderColor: "var(--border-default)" }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: "var(--admin-accent)", color: "white" }}>MV</div>
            <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Admin</span>
          </div>
          <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
            {adminNav.map((item) => {
              const isActive = active === item.id
              return (
                <motion.button key={item.id} onClick={() => setActive(item.id)}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2.5 w-full rounded-lg text-xs outline-none"
                  style={{ padding: "6px 10px", backgroundColor: isActive ? "var(--admin-accent)" : "transparent", color: isActive ? "white" : "var(--text-tertiary)", fontWeight: isActive ? 600 : 400, border: "none", cursor: "pointer" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                    <path d={item.icon} />
                  </svg>
                  <span className="truncate">{item.label}</span>
                </motion.button>
              )
            })}
          </div>
        </div>
      }
      toolbarContent={
        <div className="flex items-center h-10 px-3 gap-2">
          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>MeterVerse Administration</span>
          <div className="flex-1" />
          <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>{active}</span>
        </div>
      }
      tabBar={<WorkspaceTabs />}
      statusBar={
        <div className="flex items-center h-6 px-3 gap-2 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
          <span>Admin Panel</span>
          <span style={{ color: "var(--text-quaternary)" }}>|</span>
          <span style={{ color: "var(--status-success)" }}>● Connected</span>
        </div>
      }
      inspectorContent={<InspectorPanel />}
    >
      <div className="h-full">
        {PageComponent && <PageComponent />}
      </div>
    </WorkspaceLayout>
    </div>
  )
}
