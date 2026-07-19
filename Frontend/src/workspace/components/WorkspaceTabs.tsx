"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useWorkspaceStore } from "../stores"
import { transitions } from "@/design-system/motion"

export function WorkspaceTabs() {
  const { tabs, activeTabId, setActiveTab, closeTab } = useWorkspaceStore()

  return (
    <div className="flex items-center h-10 border-b overflow-x-auto shrink-0 scrollbar-thin" style={{ backgroundColor: "var(--surface-topbar, #FFFFFF)", borderColor: "var(--border-default, #E5E5E5)" }}>
      <AnimatePresence mode="popLayout">
        {tabs.map((tab) => (
          <motion.div
            key={tab.id}
            layout
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={transitions.fast}
            role="tab"
            aria-selected={tab.id === activeTabId}
            onClick={() => setActiveTab(tab.id)}
            onKeyDown={(e) => { if (e.key === "Enter") setActiveTab(tab.id) }}
            tabIndex={0}
            className="relative flex items-center gap-1.5 px-4 h-full text-xs whitespace-nowrap border-r shrink-0 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-inset group select-none"
            style={{
              backgroundColor: tab.id === activeTabId ? "var(--surface-base, #FAFAFA)" : "transparent",
              color: tab.id === activeTabId ? "var(--text-primary, #0A0A0A)" : "var(--text-tertiary, #A3A3A3)",
              borderColor: "var(--border-default, #E5E5E5)",
            }}
          >
            {/* Premium active tab indicator with brightness pulse */}
            {tab.id === activeTabId && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0"
                style={{ height: 2 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {/* Main line with brightness fade in/out */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ background: "linear-gradient(90deg, var(--brand-primary), var(--brand-primary), var(--brand-primary))", backgroundSize: "200% 100%" }}
                  animate={{
                    backgroundPosition: ["0% 0%", "100% 0%"],
                    opacity: [0.7, 1, 0.7],
                    scaleX: [1, 1.02, 1],
                  }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                />
                {/* Glow beneath with pulse */}
                <motion.div
                  className="absolute -bottom-1 left-1 right-1 h-4 rounded-full"
                  style={{ background: "radial-gradient(ellipse at center, rgba(var(--brand-primary-rgb), 0.4) 0%, transparent 70%)", filter: "blur(6px)" }}
                  animate={{ opacity: [0.3, 0.7, 0.3], scale: [0.95, 1.05, 0.95] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                />
              </motion.div>
            )}
            {tab.dirty && (
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: "var(--status-pending, #D97706)" }} />
            )}
            <span className="truncate max-w-[120px]">{tab.label}</span>
            {tab.pinned && (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 opacity-50">
                <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
              </svg>
            )}
            {!tab.pinned && (
              <span
                role="button"
                tabIndex={0}
                aria-label={`Close ${tab.label} tab`}
                onClick={(e) => { e.stopPropagation(); closeTab(tab.id) }}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); closeTab(tab.id) } }}
                className="w-3.5 h-3.5 flex items-center justify-center rounded-sm opacity-0 group-hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer transition-opacity"
                style={{ color: "var(--text-tertiary, #A3A3A3)" }}
              >
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </span>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
