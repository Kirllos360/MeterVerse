"use client"

import { useState, type ReactNode } from "react"
import { motion } from "framer-motion"
import { AmbientBackground } from "@/components/effects/AmbientBackground"
const adminNav = [
  { id: "dashboard", label: "Dashboard", icon: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" },
  { id: "users", label: "Users", icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8" },
  { id: "roles", label: "Roles", icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" },
  { id: "monitoring", label: "Monitoring", icon: "M12 2a10 10 0 1010 10M12 12l4-4M12 2v10" },
  { id: "ai-diagnostics", label: "AI Diagnostics", icon: "M12 2l7 3v6c0 4.5-3 8.7-7 10-4-1.3-7-5.5-7-10V5l7-3z" },
  { id: "logs", label: "Logs", icon: "M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" },
  { id: "audit", label: "Audit", icon: "M9 12l2 2 4-4M7.5 21h9M7.5 21a2.5 2.5 0 01-2.5-2.5V5A2.5 2.5 0 017.5 2.5h9A2.5 2.5 0 0119 5v13.5a2.5 2.5 0 01-2.5 2.5" },
  { id: "security", label: "Security", icon: "M12 2l7 3v6c0 4.5-3 8.7-7 10-4-1.3-7-5.5-7-10V5l7-3z" },
  { id: "settings", label: "Settings", icon: "M12 15a3 3 0 100-6 3 3 0 000 6z" },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [active, setActive] = useState("dashboard")
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex h-screen relative" style={{ backgroundColor: "var(--admin-background)" }}>
      <AmbientBackground />
            {/* Admin Sidebar */}
      <aside className="flex flex-col shrink-0 border-r transition-all duration-200" style={{
        width: collapsed ? 64 : 220,
        backgroundColor: "var(--admin-surface)",
        borderColor: "var(--admin-border)",
      }}>
        <div className="flex items-center h-14 px-4 border-b shrink-0" style={{ borderColor: "var(--admin-border)" }}>
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold" style={{ backgroundColor: "var(--status-error)", color: "white" }}>A</div>
            {!collapsed && <span className="text-sm font-bold text-white">Admin Center</span>}
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {adminNav.map((item) => (
            <button key={item.id} onClick={() => setActive(item.id)}
              className="flex items-center gap-3 w-full rounded-lg text-sm transition-colors outline-none"
              style={{
                padding: collapsed ? "10px" : "8px 12px",
                justifyContent: collapsed ? "center" : "flex-start",
                backgroundColor: active === item.id ? "rgba(var(--brand-rgb), 0.15)" : "transparent",
                color: active === item.id ? "var(--status-error)" : "rgba(255,255,255,0.5)",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <path d={item.icon} />
              </svg>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="p-2 border-t shrink-0" style={{ borderColor: "var(--admin-border)" }}>
          <button onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center w-full p-2 rounded-lg text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
            {collapsed ? "→" : "Collapse"}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}


