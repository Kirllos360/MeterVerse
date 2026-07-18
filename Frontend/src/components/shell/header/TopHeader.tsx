"use client"

import { type ReactNode } from "react"
import { useLayoutStore } from "@/stores"
import { icons } from "@/design-system/icons"
import { transitions } from "@/design-system/motion"
import { motion } from "framer-motion"

interface TopHeaderProps {
  leftSlot?: ReactNode
  centerSlot?: ReactNode
  rightSlot?: ReactNode
}

export function TopHeader({ leftSlot, centerSlot, rightSlot }: TopHeaderProps) {
  const { sidebarMode, toggleSidebar } = useLayoutStore()
  const isCollapsed = sidebarMode === "collapsed" || sidebarMode === "dock"

  return (
    <motion.header
      className="sticky top-0 z-20 flex items-center h-12 px-4 border-b"
      style={{
        backgroundColor: "var(--surface-topbar, rgba(255,255,255,0.85))",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderColor: "var(--border-default, #E5E5E5)",
      }}
      initial={false}
      animate={{ opacity: 1 }}
      transition={transitions.smooth}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={transitions.fast}
          onClick={toggleSidebar}
          className="flex items-center justify-center w-8 h-8 rounded-lg outline-none focus-visible:ring-2"
          style={{ color: "var(--text-secondary, #737373)" }}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1={9} y1="3" x2={9} y2="21" />
          </svg>
        </motion.button>
        {leftSlot}
      </div>

      <div className="flex items-center justify-center flex-1 min-w-0">{centerSlot}</div>

      <div className="flex items-center justify-end gap-1 flex-1 min-w-0">{rightSlot}</div>
    </motion.header>
  )
}
