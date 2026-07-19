"use client"

import { type ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useWorkspaceStore } from "../stores"

interface WorkspaceLayoutProps {
  sidebarContent: ReactNode
  toolbarContent?: ReactNode
  tabBar?: ReactNode
  children: ReactNode
  inspectorContent?: ReactNode
  statusBar?: ReactNode
}

export function WorkspaceLayout({
  sidebarContent,
  toolbarContent,
  tabBar,
  children,
  inspectorContent,
  statusBar,
}: WorkspaceLayoutProps) {
  const { sidebarMode, inspectorOpen, setInspectorOpen } = useWorkspaceStore()

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden" style={{ backgroundColor: "var(--surface-base)" }}>
      {/* HEADER */}
      {toolbarContent && (
        <div className="shrink-0 z-40 relative" style={{ borderBottom: "1px solid var(--border-default)", backgroundColor: "var(--surface-topbar)", boxShadow: "var(--shadow-sm)" }}>
          {toolbarContent}
        </div>
      )}

      {/* MIDDLE SECTION */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* SIDEBAR — no border, elevation only */}
        <motion.div
          className="relative z-30 shrink-0 pointer-events-none"
          style={{ padding: "0 0 0 0", alignSelf: "stretch" }}
          animate={{ width: sidebarMode === "expanded" ? 260 : sidebarMode === "collapsed" ? 72 : 72 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            className="pointer-events-auto h-full overflow-hidden"
            animate={{ width: sidebarMode === "expanded" ? 260 : 72 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {sidebarContent}
          </motion.div>
        </motion.div>

        {/* MAIN CONTENT — no borders */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {tabBar && (
            <div className="shrink-0" style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--surface-raised)" }}>
              {tabBar}
            </div>
          )}
          <div className="flex-1 overflow-y-auto overflow-x-hidden">{children}</div>
        </div>

        {/* INSPECTOR — contextual, collapsed by default */}
        <AnimatePresence>
          {inspectorOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="shrink-0 overflow-hidden relative z-30"
              style={{ borderLeft: "1px solid var(--border-subtle)" }}
            >
              <div className="h-full overflow-hidden">
                {inspectorContent}
              </div>
              {/* Close button */}
              <button
                onClick={() => setInspectorOpen(false)}
                className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center text-xs transition-colors hover:opacity-80 z-10"
                style={{ color: "var(--inspector-text-muted)" }}
                aria-label="Close inspector"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FOOTER */}
      {statusBar && (
        <div className="shrink-0 z-40 relative" style={{ borderTop: "1px solid var(--border-subtle)", backgroundColor: "var(--surface-topbar)" }}>
          {statusBar}
        </div>
      )}
    </div>
  )
}
