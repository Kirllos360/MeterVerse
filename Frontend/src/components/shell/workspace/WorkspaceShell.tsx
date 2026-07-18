"use client"

import { type ReactNode } from "react"
import { motion } from "framer-motion"
import { variants, transitions } from "@/design-system/motion"

interface WorkspaceShellProps {
  toolbar?: ReactNode
  tabs?: ReactNode
  children: ReactNode
  placeholder?: ReactNode
}

export function WorkspaceShell({ toolbar, tabs, children, placeholder }: WorkspaceShellProps) {
  return (
    <motion.div
      className="flex flex-col h-full overflow-hidden"
      variants={variants.fadeIn}
      initial="initial"
      animate="animate"
      transition={transitions.smooth}
    >
      {toolbar && <div className="shrink-0">{toolbar}</div>}
      {tabs && <div className="shrink-0">{tabs}</div>}
      <div className="flex-1 overflow-y-auto" style={{ padding: "var(--space-6, 24px) var(--space-8, 32px)" }}>
        {children}
        {placeholder}
      </div>
    </motion.div>
  )
}
