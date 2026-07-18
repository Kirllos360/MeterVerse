"use client"

import { type ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useLayoutStore } from "@/stores"
import { transitions, variants } from "@/design-system/motion"

interface SidebarProps {
  header?: ReactNode
  children: ReactNode
  footer?: ReactNode
}

export function Sidebar({ header, children, footer }: SidebarProps) {
  const { sidebarMode, sidebarWidth, setSidebarWidth } = useLayoutStore()
  const isCollapsed = sidebarMode === "collapsed"
  const isDock = sidebarMode === "dock"
  const isFloating = sidebarMode === "floating"
  const isExpanded = sidebarMode === "expanded"

  if (isDock) return null

  const width = isCollapsed ? 64 : isFloating ? 256 : sidebarWidth

  return (
    <motion.aside
      initial={false}
      animate={{
        width,
        borderRadius: isFloating ? 16 : 0,
      }}
      transition={transitions.smooth}
      className="relative flex flex-col h-full overflow-hidden z-30"
      style={{
        backgroundColor: "var(--sidebar-bg, #064E3B)",
        borderInlineEnd: isFloating ? "none" : "1px solid var(--sidebar-border, rgba(255,255,255,0.06))",
        boxShadow: isFloating ? "0 8px 32px rgba(0,0,0,0.12)" : "none",
      }}
      role="navigation"
      aria-label="Main navigation"
      aria-expanded={isExpanded}
    >
      {header && <div className="shrink-0">{header}</div>}

      <div className="flex-1 overflow-y-auto px-2 py-3 scrollbar-thin" role="menu">
        <AnimatePresence mode="wait">
          <motion.div
            key={sidebarMode}
            variants={variants.staggerContainer}
            initial="initial"
            animate="animate"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>

      {footer && <div className="shrink-0">{footer}</div>}

      {isExpanded && (
        <div
          onMouseDown={(e) => {
            e.preventDefault()
            const startX = e.clientX
            const startW = sidebarWidth
            const handleMouseMove = (ev: MouseEvent) => {
              const delta = ev.clientX - startX
              setSidebarWidth(Math.max(48, Math.min(480, startW + delta)))
            }
            const handleMouseUp = () => {
              document.removeEventListener("mousemove", handleMouseMove)
              document.removeEventListener("mouseup", handleMouseUp)
            }
            document.addEventListener("mousemove", handleMouseMove)
            document.addEventListener("mouseup", handleMouseUp)
          }}
          className="absolute top-0 inset-inline-end-0 w-1.5 h-full cursor-col-resize group z-20"
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize sidebar"
          tabIndex={0}
        >
          <div className="absolute inset-y-0 inset-inline-end-0 w-1 rounded-full bg-transparent group-hover:bg-[rgba(0,191,165,0.4)] transition-colors duration-120" />
        </div>
      )}
    </motion.aside>
  )
}

