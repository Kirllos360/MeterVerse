"use client"

import { useState, useRef, useEffect, type ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
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

const ITEM_H = 36
const ITEM_GAP = 4
const PADDING_Y = 10
const COLLAPSED_W = 56
const EXPANDED_W = 200

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const active = pathname.split("/").pop() || "dashboard"
  const [expanded, setExpanded] = useState(false)
  const [manualToggle, setManualToggle] = useState(false)
  const navRef = useRef<HTMLDivElement>(null)
  const hoverTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const itemCount = adminNav.length
  const islandH = itemCount * ITEM_H + (itemCount - 1) * ITEM_GAP + PADDING_Y * 2
  const islandW = expanded ? EXPANDED_W : COLLAPSED_W

  const navigate = (id: string) => {
    router.push(`/admin/${id}`)
    setExpanded(false)
    setManualToggle(false)
  }

  const handleMouseEnter = () => {
    if (manualToggle) return
    clearTimeout(hoverTimer.current)
    hoverTimer.current = setTimeout(() => setExpanded(true), 150)
  }

  const handleMouseLeave = () => {
    if (manualToggle) return
    clearTimeout(hoverTimer.current)
    hoverTimer.current = setTimeout(() => setExpanded(false), 300)
  }

  useEffect(() => {
    return () => clearTimeout(hoverTimer.current)
  }, [])

  return (
    <div className="flex h-screen relative" style={{ backgroundColor: "var(--admin-background)" }}>
      <AmbientBackground />

      {/* Dynamic Island Navigation */}
      <div
        className="fixed z-50"
        style={{ left: 16, top: "50%", transform: "translateY(-50%)" }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div
          ref={navRef}
          animate={{ width: islandW, height: islandH }}
          transition={{ type: "spring", stiffness: 300, damping: 28, mass: 0.8 }}
          style={{
            borderRadius: 28,
            backgroundColor: "rgba(15,15,25,0.75)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: expanded
              ? "0 8px 40px rgba(0,0,0,0.45), 0 0 0 1px rgba(239,68,68,0.1), inset 0 1px 0 rgba(255,255,255,0.06)"
              : "0 4px 20px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.05)",
            overflow: "hidden",
            cursor: "pointer",
          }}
        >
          {/* Logo pill — always visible */}
          <div
            className="flex items-center justify-center"
            style={{ height: ITEM_H, margin: `${PADDING_Y}px 0 0` }}
          >
            <motion.div
              animate={{ width: expanded ? EXPANDED_W - 16 : COLLAPSED_W - 16 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="flex items-center gap-2.5"
              style={{ justifyContent: expanded ? "flex-start" : "center", paddingLeft: expanded ? 12 : 0 }}
            >
              <div
                className="flex items-center justify-center shrink-0"
                style={{
                  width: 26, height: 26, borderRadius: 8,
                  background: "linear-gradient(135deg, #EF4444, #DC2626)",
                  color: "white", fontSize: 11, fontWeight: 700,
                }}
              >
                A
              </div>
              <AnimatePresence>
                {expanded && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.15 }}
                    className="text-sm font-semibold truncate whitespace-nowrap overflow-hidden"
                    style={{ color: "rgba(255,255,255,0.9)" }}
                  >
                    Admin Center
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, margin: "6px 12px", backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 1 }} />

          {/* Nav items */}
          <nav className="flex flex-col" style={{ padding: "0 6px" }}>
            {adminNav.map((item, i) => {
              const isActive = active === item.id
              return (
                <motion.button
                  key={item.id}
                  onClick={() => navigate(item.id)}
                  className="flex items-center gap-3 outline-none"
                  animate={{
                    width: expanded ? EXPANDED_W - 12 : COLLAPSED_W - 12,
                    paddingLeft: expanded ? 10 : 0,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 28 }}
                  style={{
                    height: ITEM_H,
                    justifyContent: expanded ? "flex-start" : "center",
                    borderRadius: 10,
                    backgroundColor: isActive ? "rgba(239,68,68,0.15)" : "transparent",
                    border: isActive ? "1px solid rgba(239,68,68,0.2)" : "1px solid transparent",
                    position: "relative",
                  }}
                  whileHover={{ backgroundColor: isActive ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.04)" }}
                  whileTap={{ scale: 0.96 }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activePill"
                      className="absolute inset-0"
                      style={{ borderRadius: 10, backgroundColor: "rgba(239,68,68,0.08)" }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <svg
                    width="16" height="16" viewBox="0 0 24 24"
                    fill="none" stroke={isActive ? "#EF4444" : "rgba(255,255,255,0.4)"}
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className="shrink-0 relative z-10"
                    style={{ filter: isActive ? "drop-shadow(0 0 6px rgba(239,68,68,0.4))" : "none" }}
                  >
                    <path d={item.icon} />
                  </svg>
                  <AnimatePresence>
                    {expanded && (
                      <motion.span
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        transition={{ duration: 0.12, delay: i * 0.008 }}
                        className="text-xs truncate relative z-10"
                        style={{
                          color: isActive ? "#EF4444" : "rgba(255,255,255,0.55)",
                          fontWeight: isActive ? 600 : 400,
                        }}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              )
            })}
          </nav>

          {/* Footer toggle */}
          <div style={{ padding: "4px 6px 8px" }}>
            <motion.button
              onClick={() => { setManualToggle(!manualToggle); setExpanded(!expanded) }}
              className="flex items-center justify-center outline-none w-full"
              whileHover={{ backgroundColor: "rgba(255,255,255,0.04)" }}
              style={{ height: 24, borderRadius: 8, fontSize: 10, color: "rgba(255,255,255,0.25)" }}
            >
              <motion.span
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                ◀
              </motion.span>
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}



