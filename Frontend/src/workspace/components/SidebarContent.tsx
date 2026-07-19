"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useWorkspaceStore } from "../stores"
import { useAppRegistry, categories } from "@/app-framework/registry/application-registry"
import { useTranslation } from "@/hooks/use-translation"

const ICONS: Record<string, string> = {
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
    .filter(Boolean) as { id: string; label: string; icon: string; apps: { id: string; title: string; badge?: string | number; beta?: boolean }[] }[]

  const allApps = getActive().filter((a) => a.visible !== false)

  const handleNav = (id: string, label: string) => {
    if (!isExpanded) { setIsExpanded(true); setTimeout(() => openTab({ id, label }), 150) }
    else { openTab({ id, label }) }
  }

  return (
    <aside className="h-full flex flex-col" style={{ backgroundColor: "var(--sidebar-background)" }}>
      {/* Electric spark + signal wave header */}
      <div className="shrink-0 relative" style={{ borderBottom: "1px solid var(--sidebar-border)" }}>
        <ElectricSpark />
        <div className="flex items-center justify-center h-10">
          <motion.svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--sidebar-text)" strokeWidth="1.5" strokeLinecap="round"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            <path d="M3 12h2M7 8h2M11 4h2M15 8h2M19 12h2" />
            <path d="M5 10h2M9 6h2M13 6h2M17 10h2" opacity="0.6" />
          </motion.svg>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2">
        {navGroups.map((group) => {
          const isCatExpanded = expandedCategories[group.id] !== false
          return (
            <div key={group.id} className="mb-1">
              {/* Category header */}
              <button
                onClick={() => toggleCategory(group.id)}
                className="flex items-center w-full px-4 h-8 text-left transition-colors hover:opacity-80"
                style={{ color: "var(--sidebar-category-text)" }}
                aria-label={`${t(`nav.${group.id}`, group.label)} section`}
              >
                {isExpanded ? (
                  <>
                    <motion.svg animate={{ rotate: isCatExpanded ? 90 : 0 }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></motion.svg>
                    <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider flex-1">{t(`nav.${group.id}`, group.label)}</span>
                    <span className="text-[10px]" style={{ color: "var(--sidebar-count-text)" }}>{group.apps.length}</span>
                  </>
                ) : (
                  <div className="flex justify-center w-full">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--sidebar-icon)" strokeWidth="1.5" strokeLinecap="round">
                      <path d={ICONS[group.id] || ICONS.executive} />
                    </svg>
                  </div>
                )}
              </button>

              {/* Apps */}
              {isExpanded && isCatExpanded && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.12 }}>
                  {group.apps.map((app) => {
                    const isActive = activeTabId === app.id
                    return (
                      <button
                        key={app.id}
                        onClick={() => handleNav(app.id, app.title)}
                        className="relative flex items-center w-full h-8 px-4 text-left transition-colors duration-75 hover:opacity-90"
                        style={{
                          color: isActive ? "var(--sidebar-text)" : "var(--sidebar-text-muted)",
                          backgroundColor: isActive ? "var(--sidebar-active)" : "transparent",
                          paddingLeft: isExpanded ? 36 : undefined,
                        }}
                      >
                        {/* 3px active indicator */}
                        {isActive && isExpanded && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4" style={{ backgroundColor: "var(--brand)" }} />
                        )}
                        {/* Icon */}
                        <span className="text-xs w-5 text-center shrink-0" style={{ color: isActive ? "var(--brand)" : "var(--sidebar-icon)" }}>
                          {(t(`nav.${app.id}`, app.title) || app.title)[0]}
                        </span>
                        {/* Label + badge */}
                        {isExpanded && (
                          <span className="ml-3 text-xs flex-1 truncate flex items-center gap-2">
                            {t(`nav.${app.id}`, app.title)}
                            {app.badge && (
                              <span className="px-1 py-[1px] rounded text-[10px] font-medium" style={{ backgroundColor: "rgba(var(--status-error-rgb), 0.15)", color: "var(--status-error)" }}>
                                {app.badge}
                              </span>
                            )}
                            {app.beta && <span className="text-[10px]" style={{ color: "var(--status-pending)" }}>BETA</span>}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </motion.div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="shrink-0 px-4 py-3" style={{ borderTop: "1px solid var(--sidebar-border)" }}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 w-full text-xs transition-colors duration-75 hover:opacity-80"
          style={{ color: "var(--sidebar-category-text)" }}
          aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          <motion.svg animate={{ rotate: isExpanded ? 180 : 0 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></motion.svg>
          {isExpanded && <span>{t("sidebar.collapse", "Collapse")}</span>}
        </button>
      </div>
    </aside>
  )
}

function ElectricSpark() {
  return (
    <div className="absolute inset-x-0 top-0 h-6 pointer-events-none overflow-hidden" style={{ opacity: 0.5 }}>
      <svg width="100%" height="24" viewBox="0 0 200 24" preserveAspectRatio="none">
        {[0,1,2].map((i) => (
          <motion.polyline
            key={i}
            points="0,12 10,4 20,17 30,7 40,20 50,10 60,18 70,5 80,16 90,8 100,21 110,11 120,19 130,6 140,14 150,9 160,20 170,10 180,17 190,5 200,12"
            fill="none"
            stroke="var(--brand)"
            strokeWidth={1.5 - i * 0.4}
            opacity={0.3 - i * 0.08}
            animate={{ opacity: [0.05, 0.4, 0.05] }}
            transition={{ duration: 0.8 + i * 0.3, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </svg>
    </div>
  )
}
