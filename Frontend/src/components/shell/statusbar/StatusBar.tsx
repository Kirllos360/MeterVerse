"use client"

import { motion } from "framer-motion"
import { icons } from "@/design-system/icons"
import { transitions } from "@/design-system/motion"

export function StatusBar() {
  return (
    <motion.footer
      className="flex items-center h-8 px-4 text-[11px] border-t shrink-0"
      style={{
        backgroundColor: "var(--surface-base, #FAFAFA)",
        borderColor: "var(--border-default, #E5E5E5)",
        color: "var(--text-tertiary, #A3A3A3)",
      }}
      initial={false}
      animate={{ opacity: 1 }}
      transition={transitions.smooth}
      aria-label="Status bar"
    >
      <div className="flex items-center gap-4 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--status-active, #059669)" }} />
          API Connected
        </span>
        <span className="hidden md:flex items-center gap-1.5">
          <icons.Globe className="w-3 h-3" />
          EN
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span className="hidden md:inline">October</span>
        <span className="hidden lg:inline">v8.0.0</span>
      </div>
    </motion.footer>
  )
}
