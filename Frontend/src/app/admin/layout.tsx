"use client"

import { useState, useRef, useEffect, type ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { AmbientBackground } from "@/components/effects/AmbientBackground"

const adminNav = [
  { id: "dashboard", label: "Dashboard", icon: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" },
  { id: "users", label: "Users", icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8" },
  { id: "roles", label: "Roles", icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" },
  { id: "audit", label: "Audit", icon: "M9 12l2 2 4-4M7.5 21h9M7.5 21a2.5 2.5 0 01-2.5-2.5V5A2.5 2.5 0 017.5 2.5h9A2.5 2.5 0 0119 5v13.5a2.5 2.5 0 01-2.5 2.5" },
  { id: "settings", label: "Settings", icon: "M12 15a3 3 0 100-6 3 3 0 000 6z" },
  { id: "sessions", label: "Sessions", icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" },
  { id: "api-keys", label: "API Keys", icon: "M15 7a3 3 0 11-6 0 3 3 0 016 0zM9 12h6M12 9v6" },
  { id: "feature-flags", label: "Flags", icon: "M9 3v2M9 19v2M3 9h2M19 9h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5" },
  { id: "domains", label: "Domains", icon: "M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7M4 7h16M9 11h6" },
  { id: "reports", label: "Reports", icon: "M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7M4 7h16M9 11h6" },
  { id: "services", label: "Services", icon: "M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" },
]

const ITEM_H = 40
const ITEM_GAP = 2
const PADDING_Y = 8
const COLLAPSED_W = 48
const EXPANDED_W = 180

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const active = pathname.split("/").pop() || "dashboard"
  const [expanded, setExpanded] = useState(false)
  const [manualToggle, setManualToggle] = useState(false)
  const navRef = useRef<HTMLDivElement>(null)
  const hoverTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 })

  const itemCount = adminNav.length
  const islandH = itemCount * ITEM_H + (itemCount - 1) * ITEM_GAP + PADDING_Y * 2 + 32
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
    <div className="flex min-h-screen relative" style={{ backgroundColor: "var(--admin-background)" }}>
      <AmbientBackground />

      {/* Dynamic Island Navigation */}
      <div
        className="fixed z-50"
        style={{ left: 12, top: "50%", transform: "translateY(-50%)" }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={(e) => {
          const rect = navRef.current?.getBoundingClientRect()
          if (rect) setGlowPos({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 })
        }}
      >
        {/* Animated border glow */}
        <motion.div
          animate={{ width: islandW + 4, height: islandH + 4 }}
          transition={{ type: "spring", stiffness: 300, damping: 28, mass: 0.8 }}
          style={{
            position: "absolute", top: -2, left: -2,
            borderRadius: 30,
            background: `radial-gradient(circle at ${glowPos.x}% ${glowPos.y}%, rgba(239,68,68,0.25), rgba(239,68,68,0.05) 40%, transparent 70%)`,
            filter: "blur(4px)",
            pointerEvents: "none",
            transition: "background 0.3s ease",
          }}
        />

        {/* Main island */}
        <motion.div
          ref={navRef}
          animate={{ width: islandW, height: islandH }}
          transition={{ type: "spring", stiffness: 350, damping: 26, mass: 0.7 }}
          style={{
            borderRadius: 22,
            backgroundColor: "rgba(12,12,22,0.82)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: expanded
              ? "0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(239,68,68,0.12), inset 0 1px 0 rgba(255,255,255,0.06)"
              : "0 4px 16px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.04)",
            overflow: "hidden",
            cursor: "pointer",
            position: "relative",
          }}
        >
          {/* Nav items — no logo, no divider, cleaner */}
          <nav className="flex flex-col" style={{ padding: `${PADDING_Y}px 5px` }}>
            {adminNav.map((item, i) => {
              const isActive = active === item.id
              return (
                <motion.button
                  key={item.id}
                  onClick={() => navigate(item.id)}
                  className="flex items-center gap-2.5 outline-none"
                  animate={{
                    width: expanded ? EXPANDED_W - 10 : COLLAPSED_W - 10,
                    paddingLeft: expanded ? 9 : 0,
                  }}
                  transition={{ type: "spring", stiffness: 350, damping: 26 }}
                  style={{
                    height: ITEM_H,
                    justifyContent: expanded ? "flex-start" : "center",
                    borderRadius: 10,
                    backgroundColor: isActive ? "rgba(239,68,68,0.12)" : "transparent",
                    border: isActive ? "1px solid rgba(239,68,68,0.15)" : "1px solid transparent",
                    position: "relative",
                    marginBottom: i < adminNav.length - 1 ? ITEM_GAP : 0,
                  }}
                  whileHover={{
                    backgroundColor: isActive ? "rgba(239,68,68,0.18)" : "rgba(255,255,255,0.05)",
                    scale: 1.02,
                  }}
                  whileTap={{ scale: 0.96 }}
                >
                  {/* Active indicator bar */}
                  {isActive && (
                    <motion.div
                      layoutId="activeBar"
                      className="absolute"
                      style={{
                        left: 0, top: "50%",
                        width: 3, height: 18,
                        borderRadius: "0 3px 3px 0",
                        background: "linear-gradient(to bottom, #EF4444, #DC2626)",
                        transform: "translateY(-50%)",
                        boxShadow: "0 0 8px rgba(239,68,68,0.4)",
                      }}
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}

                  <div
                    className="shrink-0 relative z-10 flex items-center justify-center"
                    style={{
                      width: 24, height: 24, borderRadius: 8,
                      backgroundColor: isActive ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.04)",
                      transition: "background-color 0.2s",
                    }}
                  >
                    <svg
                      width="14" height="14" viewBox="0 0 24 24"
                      fill="none" stroke={isActive ? "#EF4444" : "rgba(255,255,255,0.35)"}
                      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      style={{ filter: isActive ? "drop-shadow(0 0 4px rgba(239,68,68,0.3))" : "none" }}
                    >
                      <path d={item.icon} />
                    </svg>
                  </div>

                  <AnimatePresence>
                    {expanded && (
                      <motion.span
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -6 }}
                        transition={{ duration: 0.1, delay: i * 0.01 }}
                        className="text-xs truncate relative z-10"
                        style={{
                          color: isActive ? "#EF4444" : "rgba(255,255,255,0.5)",
                          fontWeight: isActive ? 600 : 400,
                          letterSpacing: "0.01em",
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

          {/* Expand/collapse pill */}
          <div style={{ padding: "0 8px 8px" }}>
            <motion.button
              onClick={() => { setManualToggle(!manualToggle); setExpanded(!expanded) }}
              className="flex items-center justify-center outline-none w-full"
              whileHover={{ backgroundColor: "rgba(255,255,255,0.04)" }}
              style={{ height: 20, borderRadius: 6, fontSize: 9, color: "rgba(255,255,255,0.2)" }}
            >
              <motion.span
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                style={{ display: "inline-block" }}
              >
                ◀
              </motion.span>
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1">{children}</div>
      </div>
    </div>
  )
}



