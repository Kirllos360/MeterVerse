"use client"

import { motion } from "framer-motion"
import { useLayoutStore } from "@/stores"
import { variants } from "@/design-system/motion"
import type { ReactNode } from "react"

interface SidebarSectionProps {
  label?: string
  children: ReactNode
}

export function SidebarSection({ label, children }: SidebarSectionProps) {
  const { sidebarMode } = useLayoutStore()
  const showLabel = sidebarMode === "expanded"

  return (
    <div className="mb-4">
      {showLabel && label && (
        <div className="px-3 mb-1.5">
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.12em]"
            style={{ color: "var(--sidebar-text-muted, rgba(255,255,255,0.45))" }}
          >
            {label}
          </span>
        </div>
      )}
      <motion.div
        variants={variants.staggerContainer}
        initial="initial"
        animate="animate"
        className="space-y-0.5"
        role="group"
        aria-label={label}
      >
        {children}
      </motion.div>
    </div>
  )
}
