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
            style={{ padding: "8px 0 8px 8px", alignSelf: "stretch" }}
            animate={{ width: sidebarMode === "expanded" ? 269 : sidebarMode === "collapsed" ? 81 : 81 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              className="pointer-events-auto h-full overflow-hidden rounded-2xl"
              style={{ backgroundColor: "var(--sidebar-background)" }}
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

        {/* INSPECTOR — collapsible like sidebar (48px collapsed, 336px expanded) */}
        <motion.div
          animate={{ width: inspectorOpen ? 336 : 48 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="shrink-0 relative z-30"
          style={{ padding: "8px 8px 8px 0", alignSelf: "stretch" }}
        >
          <div
            className="h-full overflow-hidden rounded-2xl"
            style={{ backgroundColor: "var(--sidebar-background)" }}
          >
            {inspectorContent}
          </div>
        </motion.div>
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
