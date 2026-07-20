"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useWorkspaceStore } from "../stores"

export function WorkspaceTabs() {
  const { tabs, activeTabId, setActiveTab, closeTab } = useWorkspaceStore()

  if (tabs.length === 0) return null

  return (
    <div className="flex items-center justify-center w-full py-2 px-4">
      <motion.div
        layout
        className="flex items-center gap-1 px-2 py-1"
        style={{
          borderRadius: 16,
          backgroundColor: "rgba(12,12,22,0.75)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        <AnimatePresence mode="popLayout">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId
            return (
              <motion.button
                key={tab.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 350, damping: 26 }}
                onClick={() => setActiveTab(tab.id)}
                whileHover={isActive ? {} : { scale: 1.05, backgroundColor: "rgba(255,255,255,0.04)" }}
                whileTap={{ scale: 0.95 }}
                className="relative flex items-center gap-1.5 px-3 py-1.5 text-xs whitespace-nowrap outline-none cursor-pointer select-none"
                style={{
                  borderRadius: 10,
                  color: isActive ? "#EF4444" : "rgba(255,255,255,0.5)",
                  fontWeight: isActive ? 600 : 400,
                  backgroundColor: isActive ? "rgba(239,68,68,0.1)" : "transparent",
                  border: isActive ? "1px solid rgba(239,68,68,0.15)" : "1px solid transparent",
                }}
              >
                {/* Active glow */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabGlow"
                    className="absolute inset-0"
                    style={{
                      borderRadius: 10,
                      background: "linear-gradient(135deg, rgba(239,68,68,0.08), transparent)",
                      boxShadow: "inset 0 0 12px rgba(239,68,68,0.05)",
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}

                {/* Dirty indicator */}
                {tab.dirty && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: "#F59E0B" }}
                  />
                )}

                {/* Label */}
                <span className="truncate max-w-[100px] relative z-10">{tab.label}</span>

                {/* Pinned icon */}
                {tab.pinned && (
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 opacity-50 relative z-10">
                    <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
                  </svg>
                )}

                {/* Close button */}
                {!tab.pinned && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    role="button"
                    tabIndex={0}
                    aria-label={`Close ${tab.label}`}
                    onClick={(e) => { e.stopPropagation(); closeTab(tab.id) }}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); closeTab(tab.id) } }}
                    className="w-3.5 h-3.5 flex items-center justify-center rounded-sm opacity-0 group-hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer transition-opacity relative z-10"
                    style={{ color: "rgba(255,255,255,0.3)" }}
                    whileHover={{ scale: 1.2, color: "#EF4444" }}
                  >
                    <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </motion.span>
                )}
              </motion.button>
            )
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
