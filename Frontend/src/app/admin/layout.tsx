"use client"

import { useState, type ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"
import { AmbientBackground } from "@/components/effects/AmbientBackground"

const adminNav = [
  { id: "dashboard", label: "Dashboard", icon: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" },
  { id: "users", label: "Users", icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8" },
  { id: "roles", label: "Roles & Permissions", icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" },
  { id: "audit", label: "Audit Logs", icon: "M9 12l2 2 4-4M7.5 21h9M7.5 21a2.5 2.5 0 01-2.5-2.5V5A2.5 2.5 0 017.5 2.5h9A2.5 2.5 0 0119 5v13.5a2.5 2.5 0 01-2.5 2.5" },
  { id: "settings", label: "Settings", icon: "M12 15a3 3 0 100-6 3 3 0 000 6z" },
  { id: "sessions", label: "Sessions", icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" },
  { id: "api-keys", label: "API Keys", icon: "M15 7a3 3 0 11-6 0 3 3 0 016 0zM9 12h6M12 9v6" },
  { id: "feature-flags", label: "Feature Flags", icon: "M9 3v2M9 19v2M3 9h2M19 9h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5" },
  { id: "monitoring", label: "Monitoring", icon: "M12 2a10 10 0 1010 10M12 12l4-4M12 2v10" },
  { id: "health", label: "System Health", icon: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" },
  { id: "logs", label: "Logs", icon: "M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const active = pathname.split("/").pop() || "dashboard"
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
            <button key={item.id} onClick={() => router.push(`/admin/${item.id}`)}
              className="flex items-center gap-3 w-full rounded-lg text-sm transition-colors outline-none"
              style={{
                padding: collapsed ? "10px" : "8px 12px",
                justifyContent: collapsed ? "center" : "flex-start",
                backgroundColor: active === item.id ? "rgba(239,68,68,0.15)" : "transparent",
                color: active === item.id ? "#EF4444" : "rgba(255,255,255,0.5)",
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
            className="flex items-center justify-center w-full p-2 rounded-lg text-xs" style={{ color: "var(--admin-text-dim)" }}>
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



