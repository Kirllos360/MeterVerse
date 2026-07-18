"use client"

import { motion } from "framer-motion"
import { useLayoutStore } from "@/stores"
import { icons } from "@/design-system/icons"
import { variants, transitions } from "@/design-system/motion"

const dockItems = [
  { id: "dashboard", icon: icons.Dashboard, label: "Dashboard" },
  { id: "customers", icon: icons.Customers, label: "Customers" },
  { id: "meters", icon: icons.Meters, label: "Meters" },
  { id: "invoices", icon: icons.Invoices, label: "Invoices" },
  { id: "readings", icon: icons.Readings, label: "Readings" },
]

export function SidebarDock() {
  const { sidebarWidth } = useLayoutStore()
  const dockWidth = 52

  return (
    <motion.div
      initial={{ width: dockWidth }}
      animate={{ width: dockWidth }}
      transition={transitions.morph}
      className="relative flex flex-col items-center gap-3 py-4 rounded-[20px] mx-auto shadow-2xl z-30 my-3"
      style={{
        width: dockWidth,
        backgroundColor: "var(--glass-bg, rgba(6,78,59,0.9))",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid var(--glass-border, rgba(255,255,255,0.1))",
      }}
      role="navigation"
      aria-label="Dock navigation"
    >
      {dockItems.map((item) => (
        <motion.button
          key={item.id}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.92 }}
          transition={transitions.elastic}
          className="relative flex items-center justify-center w-10 h-10 rounded-xl outline-none"
          style={{ color: "var(--sidebar-icon, #80DED2)" }}
          aria-label={item.label}
        >
          <item.icon className="w-5 h-5" />
        </motion.button>
      ))}
    </motion.div>
  )
}
