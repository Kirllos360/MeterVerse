"use client"

import { useState, useRef, useEffect, type ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { AmbientBackground } from "@/components/effects/AmbientBackground"
import { UnifiedShell } from "@/admin/layout/UnifiedShell"
import { InspectorPanel } from "@/admin/layout/InspectorPanel"

const adminNav = [
  { id: "home", label: "Home", icon: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" },
  { id: "users", label: "Users", icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8" },
  { id: "roles", label: "Roles", icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" },
  { id: "audit", label: "Audit", icon: "M9 12l2 2 4-4M7.5 21h9M7.5 21a2.5 2.5 0 01-2.5-2.5V5A2.5 2.5 0 017.5 2.5h9A2.5 2.5 0 0119 5v13.5a2.5 2.5 0 01-2.5 2.5" },
  { id: "settings", label: "Settings", icon: "M12 15a3 3 0 100-6 3 3 0 000 6z" },
  { id: "sessions", label: "Sessions", icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" },
  { id: "api-keys", label: "API Keys", icon: "M15 7a3 3 0 11-6 0 3 3 0 016 0zM9 12h6M12 9v6" },
  { id: "feature-flags", label: "Flags", icon: "M9 3v2M9 19v2M3 9h2M19 9h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5" },
  { id: "customers", label: "Customers", icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8" },
  { id: "domains", label: "Domains", icon: "M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7M4 7h16M9 11h6" },
  { id: "reports", label: "Reports", icon: "M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7M4 7h16M9 11h6" },
  { id: "services", label: "Services", icon: "M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" },
  { id: "business", label: "Business", icon: "M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7M4 7h16M9 11h6" },
  { id: "crud", label: "CRUD", icon: "M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7M4 7h16M9 11h6" },
  { id: "tables", label: "Tables", icon: "M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7M4 7h16M9 11h6" },
  { id: "ai", label: "AI", icon: "M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7M4 7h16M9 11h6" },
  { id: "runtime", label: "Runtime", icon: "M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7M4 7h16M9 11h6" },
  { id: "monitoring", label: "Monitor", icon: "M12 2a10 10 0 1010 10M12 12l4-4M12 2v10" },
  { id: "health", label: "Health", icon: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" },
  { id: "logs", label: "Logs", icon: "M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" },
  { id: "security", label: "Security", icon: "M12 2l7 3v6c0 4.5-3 8.7-7 10-4-1.3-7-5.5-7-10V5l7-3z" },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const active = pathname.split("/").pop() || "home"
  const [expanded, setExpanded] = useState(false)
  const hoverTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const [openTabs, setOpenTabs] = useState<string[]>(["home"])

  useEffect(() => {
    const page = active
    if (!openTabs.includes(page)) setOpenTabs(p => [...p, page])
  }, [active])

  return (
    <UnifiedShell
      sidebar={
        <div
          className="h-full flex flex-col items-center py-2 gap-0.5"
          onMouseEnter={() => { clearTimeout(hoverTimer.current); hoverTimer.current = setTimeout(() => setExpanded(true), 200) }}
          onMouseLeave={() => { clearTimeout(hoverTimer.current); hoverTimer.current = setTimeout(() => setExpanded(false), 300) }}
          style={{ position: "relative" }}
        >
          {/* Logo */}
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold mb-2 shrink-0" style={{ backgroundColor: "var(--brand)", color: "white" }}>M</div>

          {adminNav.slice(0, 12).map((item) => {
            const isActive = active === item.id
            return (
              <motion.button
                key={item.id}
                onClick={() => router.push(`/admin/${item.id}`)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="flex items-center justify-center outline-none relative"
                style={{
                  width: 32, height: 32, borderRadius: 8,
                  backgroundColor: isActive ? "rgba(239,68,68,0.15)" : "transparent",
                  border: isActive ? "1px solid rgba(239,68,68,0.2)" : "1px solid transparent",
                  cursor: "pointer",
                }}
                title={item.label}
              >
                {isActive && (
                  <motion.div layoutId="sidebarActive" className="absolute -left-1 w-0.5 h-4 rounded-full" style={{ backgroundColor: "#EF4444", boxShadow: "0 0 4px rgba(239,68,68,0.4)" }} transition={{ type: "spring", stiffness: 500, damping: 35 }} />
                )}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isActive ? "#EF4444" : "rgba(255,255,255,0.35)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.icon} />
                </svg>
              </motion.button>
            )
          })}

          {/* More button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            className="flex items-center justify-center outline-none mt-auto"
            style={{ width: 32, height: 32, borderRadius: 8, color: "rgba(255,255,255,0.25)", cursor: "pointer", background: "transparent", border: "none" }}
            title="More pages"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
          </motion.button>
        </div>
      }
      tabs={
        <div className="flex items-center gap-1 px-2 py-1 overflow-x-auto">
          {openTabs.map(tab => {
            const navItem = adminNav.find(n => n.id === tab)
            const isActive = active === tab
            return (
              <motion.button
                key={tab}
                layout
                onClick={() => router.push(`/admin/${tab}`)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-1 px-2.5 py-1 text-xs whitespace-nowrap outline-none"
                style={{
                  borderRadius: 6,
                  backgroundColor: isActive ? "rgba(239,68,68,0.1)" : "transparent",
                  color: isActive ? "#EF4444" : "rgba(255,255,255,0.5)",
                  fontWeight: isActive ? 600 : 400,
                  border: isActive ? "1px solid rgba(239,68,68,0.15)" : "1px solid transparent",
                  cursor: "pointer",
                }}
              >
                <span>{navItem?.label || tab}</span>
                <span onClick={(e) => { e.stopPropagation(); setOpenTabs(p => p.filter(t => t !== tab)) }} className="ml-1 opacity-0 hover:opacity-100" style={{ color: "rgba(255,255,255,0.3)" }}>×</span>
              </motion.button>
            )
          })}
        </div>
      }
      statusBar={
        <>
          <span>Admin Panel</span>
          <span className="mx-2" style={{ color: "var(--text-quaternary)" }}>|</span>
          <span>Page: {active}</span>
          <span className="mx-2" style={{ color: "var(--text-quaternary)" }}>|</span>
          <span style={{ color: "var(--status-success)" }}>● Connected</span>
        </>
      }
      inspector={<InspectorPanel />}
    >
      <AmbientBackground />
      <div className="relative z-10">{children}</div>
    </UnifiedShell>
  )
}
