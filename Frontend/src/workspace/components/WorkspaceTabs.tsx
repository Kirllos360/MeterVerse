"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useWorkspaceStore } from "../stores"
import { transitions } from "@/design-system/motion"

export function WorkspaceTabs() {
  const { tabs, activeTabId, setActiveTab, closeTab } = useWorkspaceStore()

  return (
    <div className="flex items-center h-9 overflow-x-auto shrink-0 scrollbar-thin" style={{ backgroundColor: "var(--surface-topbar)" }}>
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
            className="relative flex items-center gap-1.5 px-3 h-full text-xs whitespace-nowrap shrink-0 cursor-pointer outline-none group select-none"
            style={{
              color: tab.id === activeTabId ? "var(--text-primary)" : "var(--text-tertiary)",
              fontWeight: tab.id === activeTabId ? 600 : 400,
            }}
          >
            {tab.id === activeTabId && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-2 right-2 h-[2px]"
                style={{ backgroundColor: "var(--brand)" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            {tab.dirty && (
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: "var(--status-pending)" }} />
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
                style={{ color: "var(--text-tertiary)" }}
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

