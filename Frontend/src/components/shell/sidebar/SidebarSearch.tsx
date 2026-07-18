"use client"

import { motion } from "framer-motion"
import { useLayoutStore, useCommandStore } from "@/stores"
import { icons } from "@/design-system/icons"

export function SidebarSearch() {
  const { sidebarMode } = useLayoutStore()
  const { open } = useCommandStore()
  const isCollapsed = sidebarMode === "collapsed"

  if (isCollapsed) {
    return (
      <button
        onClick={open}
        className="flex items-center justify-center w-full p-2 rounded-lg transition-colors"
        style={{ color: "var(--sidebar-icon, #80DED2)" }}
        aria-label="Search (Cmd+K)"
      >
        <icons.Search className="w-[18px] h-[18px]" />
      </button>
    )
  }

  return (
    <div className="px-2 py-2">
      <button
        onClick={open}
        className="flex items-center gap-2 w-full rounded-lg transition-all outline-none focus-visible:ring-2"
        style={{
          height: 32,
          paddingInline: "8px",
          backgroundColor: "var(--sidebar-bg-hover, rgba(255,255,255,0.06))",
          color: "var(--sidebar-text, #E0F2F1)",
        }}
        aria-label="Search (Cmd+K)"
      >
        <icons.Search className="w-3.5 h-3.5 shrink-0" style={{ color: "rgba(255,255,255,0.4)" }} />
        <span className="flex-1 text-left text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
          Search...
        </span>
        <kbd
          className="px-1.5 py-0.5 text-[10px] font-mono rounded"
          style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.3)" }}
        >
          /
        </kbd>
      </button>
    </div>
  )
}
