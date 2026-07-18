"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useWorkspaceStore } from "../stores"
import { useAppRegistry, categories } from "@/app-framework/registry/application-registry"

import { futuristic } from "@/design-system/motion"
import { AnimatedBorder } from "@/components/effects/AnimatedBorder"
import { useTranslation } from "@/hooks/use-translation"

const categoryIcons: Record<string, string> = {
  executive: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z",
  crm: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8",
  billing: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6",
  meters: "M12 2a10 10 0 1010 10M12 12l4-4M12 2v10",
  readings: "M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2",
  operations: "M12 6V2m0 4a8 8 0 100 16 8 8 0 000-16z",
  finance: "M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",
  reports: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 5h6",
  monitoring: "M12 2a10 10 0 1010 10M12 12l4-4M12 2v10",
  iot: "M5 12h14M12 5l7 7-7 7",
  admin: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  security: "M12 2l7 3v6c0 4.5-3 8.7-7 10-4-1.3-7-5.5-7-10V5l7-3z",
  ai: "M12 2a10 10 0 0110 10c0 2-1 4-2 5M12 2a10 10 0 00-10 10c0 2 1 4 2 5",
  settings: "M12 15a3 3 0 100-6 3 3 0 000 6z",
  developer: "M10 20l4-16m-4 4l4 4-4 4",
}

export function SidebarContent() {
  const { activeTabId, openTab, sidebarMode, setSidebarMode } = useWorkspaceStore()
  const { getActive, getByCategory } = useAppRegistry()
  const { t } = useTranslation()
  const isExpanded = sidebarMode === "expanded"
  const setIsExpanded = (v: boolean) => setSidebarMode(v ? "expanded" : "collapsed")
  const isDock = sidebarMode === "dock"
  const brand = "#00BFA5"
  const bg = "#064E3B"
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})

  const toggleCategory = (catId: string) => {
    setExpandedCategories((prev) => ({ ...prev, [catId]: !prev[catId] }))
  }

  // Build grouped nav from app registry
  const navGroups = categories
    .map((cat) => {
      const apps = getByCategory(cat.id).filter((a) => a.visible !== false && a.status !== "disabled")
      if (apps.length === 0) return null
      return { ...cat, apps }
    })
    .filter(Boolean) as { id: string; label: string; icon: string; apps: { id: string; title: string; badge?: string | number; beta?: boolean; experimental?: boolean }[] }[]

  const allApps = getActive().filter((a) => a.visible !== false)

  const handleNav = (id: string, label: string) => {
    if (!isExpanded) { setIsExpanded(true); setTimeout(() => openTab({ id, label }), 150) }
    else { openTab({ id, label }) }
  }

  // Dock mode
  if (isDock) {
    return (
      <div className="flex flex-col items-center gap-2 py-3 px-1 rounded-2xl shadow-2xl" style={{ backgroundColor: bg, border: "1px solid rgba(0,191,165,0.15)", margin: "12px 0 0 12px" }}>
        {allApps.slice(0, 8).map((app) => (
          <motion.button key={app.id} {...futuristic.waveButton} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
            onClick={() => handleNav(app.id, app.title)}
            aria-label={app.title}
            className="w-9 h-9 flex items-center justify-center rounded-xl"
            style={{ color: activeTabId === app.id ? brand : "rgba(255,255,255,0.4)" }}
          >
            <span className="text-[10px] font-bold">{app.title[0]}</span>
          </motion.button>
        ))}
      </div>
    )
  }

  return (
    <div className="h-full">
      <motion.div
        animate={{ width: isExpanded ? 260 : 64 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col h-full rounded-2xl shadow-xl overflow-hidden"
        style={{ backgroundColor: bg, border: "1px solid rgba(0,191,165,0.12)" }}
      >
        {/* Premium collapse button — adaptive spring animation */}
        <motion.div
          className="shrink-0 overflow-hidden"
          animate={{ height: isExpanded ? 40 : 36 }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
        >
          <motion.button
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? t("sidebar.collapse", "Collapse sidebar") : t("sidebar.expand", "Expand sidebar")}
            className="flex items-center justify-center gap-2 w-full h-full outline-none px-3 transition-colors hover:bg-white/5 relative overflow-hidden"
            style={{ color: "rgba(255,255,255,0.3)" }}
            whileHover={{ color: "rgba(255,255,255,0.6)" }}
            whileTap={{ scale: 0.97 }}
          >
            {/* Hover glow effect */}
            <motion.div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, rgba(0,191,165,0.08) 0%, transparent 70%)" }}
              initial={{ opacity: 0 }} whileHover={{ opacity: 1 }} transition={{ duration: 0.3 }} />
            <motion.div
              animate={{ rotate: isExpanded ? 0 : 180, scale: [1, 1.2, 1] }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              whileHover={{ scale: 1.2 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </motion.div>
            {isExpanded && (
              <motion.span
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -4 }}
                className="text-[10px] font-medium"
              >
                {t("sidebar.collapse", "Collapse")}
              </motion.span>
            )}
          </motion.button>
        </motion.div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto overflow-x-hidden">
          <AnimatePresence>
            {navGroups.map((group) => {
              const isCatExpanded = expandedCategories[group.id] !== false
              return (
                <motion.div key={group.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-1">
                  {/* Category Header */}
                  {isExpanded ? (
                    <button onClick={() => toggleCategory(group.id)}
                      className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider outline-none hover:bg-white/5 transition-colors"
                      style={{ color: "rgba(255,255,255,0.3)" }}
                    >
                      <motion.svg animate={{ rotate: isCatExpanded ? 90 : 0 }} width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M9 18l6-6-6-6" />
                      </motion.svg>
                      {t(`nav.${group.id}`, group.label)}
                      <span className="text-[9px] ml-auto" style={{ color: "rgba(255,255,255,0.15)" }}>{group.apps.length}</span>
                    </button>
                  ) : (
                    <div className="flex justify-center py-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round">
                        <path d={categoryIcons[group.id] || "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"} />
                      </svg>
                    </div>
                  )}

                  {/* Apps in category */}
                  {isExpanded && isCatExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }}>
                      {group.apps.map((app) => {
                        const isActive = activeTabId === app.id
                        return (
                          <div key={app.id} className="relative group/item">
                            <AnimatedBorder active={isActive && isExpanded} className={isExpanded ? "rounded-lg" : ""}>
                              <motion.button
                                whileHover={{ x: isExpanded ? 3 : 0, scale: isExpanded ? 1.02 : 1.05 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => handleNav(app.id, app.title)}
                                aria-label={t(`nav.${app.id}`, app.title)}
                                className={`flex items-center gap-3 w-full outline-none transition-colors duration-150 ${
                                  isExpanded ? "px-3 py-1.5 rounded-lg justify-start" : "w-10 h-9 mx-auto rounded-xl justify-center"
                                }`}
                                style={{ backgroundColor: isActive ? "rgba(0,191,165,0.15)" : "transparent" }}
                              >
                                <span className="text-xs shrink-0" style={{ color: isActive ? brand : "rgba(255,255,255,0.4)" }}>
                                  {(t(`nav.${app.id}`, app.title) || app.title)[0]}
                                </span>
                                {isExpanded && (
                                  <span className="text-xs flex-1 text-left truncate flex items-center gap-1.5" style={{ color: isActive ? "#FFFFFF" : "rgba(255,255,255,0.6)" }}>
                                    {t(`nav.${app.id}`, app.title)}
                                    {app.badge && (
                                      <span className="px-1 py-0.5 rounded-full text-[8px] font-medium" style={{ backgroundColor: "rgba(239,68,68,0.2)", color: "#EF4444" }}>
                                        {app.badge}
                                      </span>
                                    )}
                                    {app.beta && <span className="text-[8px]" style={{ color: "#F59E0B" }}>BETA</span>}
                                  </span>
                                )}
                              </motion.button>
                            </AnimatedBorder>
                            {isActive && !isExpanded && (
                              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-3 rounded-r-full" style={{ backgroundColor: brand }} />
                            )}
                            {!isExpanded && !isActive && (
                              <div className="absolute left-full ml-2.5 px-2 py-1 rounded-lg opacity-0 group-hover/item:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg"
                                style={{ backgroundColor: "#043526" }}>
                                <span className="text-[10px] font-medium text-white">{t(`nav.${app.id}`, app.title)}</span>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </motion.div>
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>
        </nav>

        {/* Sidebar bottom — collapse toggle only */}
        <div className="shrink-0 p-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <button onClick={() => setIsExpanded(!isExpanded)} aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
            className="flex items-center justify-center w-full p-2 rounded-lg text-[10px] transition-colors hover:bg-white/5 outline-none"
            style={{ color: "rgba(255,255,255,0.3)" }}>
            <motion.svg animate={{ rotate: isExpanded ? 180 : 0 }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></motion.svg>
            {isExpanded && <span className="ml-2">{t("sidebar.collapse", "Collapse")}</span>}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
