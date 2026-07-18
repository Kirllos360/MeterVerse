"use client"

import { useLayoutStore } from "@/stores"
import { icons } from "@/design-system/icons"
import { transitions } from "@/design-system/motion"
import { motion } from "framer-motion"

const areas = [
  { id: "october", label: "October" },
  { id: "new-cairo", label: "New Cairo" },
  { id: "sodic", label: "SODIC" },
]

export function SidebarWorkspaceSelector() {
  const { sidebarMode } = useLayoutStore()
  const isCollapsed = sidebarMode === "collapsed"

  return (
    <div className="px-2 py-3 border-b" style={{ borderColor: "var(--sidebar-border, rgba(255,255,255,0.06))" }}>
      <div className="space-y-0.5">
        {areas.map((area) => (
          <motion.button
            key={area.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={transitions.fast}
            className={`flex items-center gap-2 w-full rounded-lg text-sm outline-none focus-visible:ring-2 transition-colors
              ${isCollapsed ? "justify-center p-2" : "p-[8px_10px]"}`}
            style={{
              color: "var(--sidebar-text, #E0F2F1)",
              backgroundColor: "transparent",
            }}
            aria-label={area.label}
          >
            <icons.Building2
              className="shrink-0"
              style={{
                width: 16,
                height: 16,
                color: "var(--sidebar-icon, #80DED2)",
              }}
            />
            {!isCollapsed && <span className="flex-1 text-left truncate">{area.label}</span>}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
