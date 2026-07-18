"use client"

import { motion } from "framer-motion"
import { useLayoutStore } from "@/stores"
import { transitions } from "@/design-system/motion"
import type { LucideIcon } from "@/design-system/icons"

interface SidebarItemProps {
  icon?: LucideIcon
  label: string
  isActive?: boolean
  badge?: string | number
  showLabel?: boolean
  className?: string
  onClick?: () => void
}

export function SidebarItem({
  icon: Icon,
  label,
  isActive,
  badge,
  showLabel = true,
  className,
  onClick,
}: SidebarItemProps) {
  const { sidebarMode } = useLayoutStore()
  const isCollapsed = sidebarMode === "collapsed"

  return (
    <motion.button
      whileHover={{ scale: isCollapsed ? 1.1 : 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={transitions.fast}
      className={`relative flex items-center gap-3 w-full rounded-lg text-sm outline-none focus-visible:ring-2 transition-colors ${
        isCollapsed ? "justify-center p-2" : "p-[10px_12px]"
      } ${className || ""}`}
      style={{
        backgroundColor: isActive ? "var(--sidebar-bg-active, rgba(0,191,165,0.2))" : "transparent",
        color: isActive ? "var(--sidebar-text-active, #FFFFFF)" : "var(--sidebar-text, #E0F2F1)",
      }}
      role="menuitem"
      aria-current={isActive ? "page" : undefined}
      aria-label={label}
      onClick={onClick}
    >
      {isActive && (
        <motion.span
          layoutId="sidebar-active-indicator"
          className="absolute inset-y-2 inset-inline-start-0 w-[3px] rounded-r-full"
          style={{ backgroundColor: "var(--brand-primary, #00BFA5)" }}
          transition={transitions.spring}
        />
      )}
      {Icon && (
        <Icon
          className="shrink-0"
          style={{
            width: isCollapsed ? 22 : 20,
            height: isCollapsed ? 22 : 20,
          }}
        />
      )}
      {showLabel && !isCollapsed && (
        <span className="flex-1 text-left truncate text-[13px]">{label}</span>
      )}
      {!isCollapsed && badge && typeof badge === "number" && (
        <span
          className="px-1.5 py-0.5 text-[10px] font-bold rounded-full"
          style={{ backgroundColor: "var(--brand-primary, #00BFA5)", color: "#FFFFFF" }}
        >
          {badge > 99 ? "99+" : badge}
        </span>
      )}
      {!isCollapsed && badge && typeof badge === "string" && (
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: "var(--status-error, #DC2626)" }}
        />
      )}
    </motion.button>
  )
}
