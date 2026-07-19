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
  const brand = "var(--brand)"
  const bg = "var(--sidebar-background)"
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})

  const toggleCategory = (catId: string) => {
    setExpandedCategories((prev) => ({ ...prev, [catId]: !prev[catId] }))
  }

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

  // Dock mode — minimal
  if (isDock) {
    return (
      <div className="flex flex-col items-center gap-1 py-3 px-1" style={{ backgroundColor: bg, margin: "12px 0 0 12px" }}>
        {allApps.slice(0, 8).map((app) => (
          <motion.button key={app.id} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={() => handleNav(app.id, app.title)}
            aria-label={app.title}
            className="w-9 h-9 flex items-center justify-center"
            style={{ color: activeTabId === app.id ? brand : "var(--sidebar-icon)" }}
          >
            <span className="text-xs font-semibold">{app.title[0]}</span>
          </motion.button>
        ))}
      </div>
    )
  }

  return (
    <div className="h-full">
      <motion.div
        animate={{ width: isExpanded ? 260 : 72 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col h-full overflow-hidden"
        style={{ backgroundColor: bg }}
      >
        {/* Header — logo area */}
        {isExpanded && (
          <div className="shrink-0 px-4 py-4 flex items-center gap-3" style={{ borderBottom: "1px solid var(--sidebar-border)" }}>
            <div className="w-7 h-7 flex items-center justify-center" style={{ color: "var(--sidebar-text)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
            </div>
            <span className="text-sm font-semibold" style={{ color: "var(--sidebar-text)" }}>MeterVerse</span>
          </div>
        )}
        {!isExpanded && (
          <div className="shrink-0 flex justify-center py-4" style={{ borderBottom: "1px solid var(--sidebar-border)" }}>
            <div className="w-5 h-5 flex items-center justify-center" style={{ color: "var(--sidebar-text)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2">
          <AnimatePresence>
            {navGroups.map((group) => {
              const isCatExpanded = expandedCategories[group.id] !== false
              return (
                <div key={group.id} className="mb-1">
                  {/* Category header — collapsible */}
                  {isExpanded ? (
                    <button onClick={() => toggleCategory(group.id)}
                      className="flex items-center gap-2 w-full px-4 py-2 text-left"
                      style={{ color: "var(--sidebar-category-text)" }}
                    >
                      <motion.svg animate={{ rotate: isCatExpanded ? 90 : 0 }} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></motion.svg>
                      <span className="text-[10px] font-semibold uppercase tracking-wider">{t(`nav.${group.id}`, group.label)}</span>
                      <span className="text-[9px] ml-auto" style={{ color: "var(--sidebar-count-text)" }}>{group.apps.length}</span>
                    </button>
                  ) : (
                    <div className="flex justify-center py-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--sidebar-icon)" strokeWidth="1.5" strokeLinecap="round">
                        <path d={categoryIcons[group.id] || "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"} />
                      </svg>
                    </div>
                  )}

                  {/* Apps */}
                  {isExpanded && isCatExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.12 }}>
                      {group.apps.map((app) => {
                        const isActive = activeTabId === app.id
                        return (
                          <div key={app.id} className="relative">
                            {/* Active accent bar */}
                            {isActive && isExpanded && (
                              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r" style={{ backgroundColor: "var(--brand)" }} />
                            )}
                            <motion.button
                              whileHover={{ x: 2 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleNav(app.id, app.title)}
                              aria-label={t(`nav.${app.id}`, app.title)}
                              className={`flex items-center gap-3 w-full text-left outline-none transition-colors duration-100 ${isExpanded ? "px-4 py-2" : "w-full flex justify-center py-2"}`}
                              style={{ backgroundColor: isActive ? "var(--sidebar-active)" : "transparent" }}
                            >
                              {/* Icon */}
                              <span className="text-xs w-5 text-center shrink-0" style={{ color: isActive ? brand : "var(--sidebar-icon)" }}>
                                {(t(`nav.${app.id}`, app.title) || app.title)[0]}
                              </span>
                              {/* Label */}
                              {isExpanded && (
                                <span className="text-xs flex-1 truncate flex items-center gap-1.5" style={{ color: isActive ? "var(--sidebar-text)" : "var(--sidebar-text-muted)" }}>
                                  {t(`nav.${app.id}`, app.title)}
                                  {app.badge && (
                                    <span className="px-1 py-0.5 rounded text-[9px] font-medium" style={{ backgroundColor: "rgba(var(--status-error-rgb), 0.15)", color: "var(--status-error)" }}>
                                      {app.badge}
                                    </span>
                                  )}
                                  {app.beta && <span className="text-[8px]" style={{ color: "var(--status-pending)" }}>BETA</span>}
                                </span>
                              )}
                            </motion.button>
                            {/* Tooltip for collapsed mode */}
                            {!isExpanded && (
                              <div className="absolute left-full ml-2 px-2.5 py-1.5 rounded opacity-0 group-hover/item:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg"
                                style={{ backgroundColor: "var(--sidebar-background)" }}>
                                <span className="text-xs" style={{ color: "var(--sidebar-text)" }}>{t(`nav.${app.id}`, app.title)}</span>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </motion.div>
                  )}
                </div>
              )
            })}
          </AnimatePresence>
        </nav>

        {/* Bottom */}
        <div className="shrink-0 px-4 py-3" style={{ borderTop: "1px solid var(--sidebar-border)" }}>
          <button onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 w-full text-xs transition-colors hover:opacity-80"
            style={{ color: "var(--sidebar-category-text)" }}>
            <motion.svg animate={{ rotate: isExpanded ? 180 : 0 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></motion.svg>
            {isExpanded && <span>{t("sidebar.collapse", "Collapse")}</span>}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
