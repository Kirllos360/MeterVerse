"use client"

import { type ReactNode } from "react"
import { motion } from "framer-motion"

export function AnimatedBorder({
  children,
  active = false,
  status = "default",
  className = "",
}: {
  children: ReactNode
  active?: boolean
  status?: "success" | "warning" | "error" | "info" | "default"
  className?: string
}) {
  const statusColors: Record<string, string> = {
    success: "#059669", warning: "#D97706", error: "#DC2626",
    info: "#3B82F6", default: "#00BFA5",
  }
  const color = statusColors[status] || statusColors.default

  if (active) {
    return (
      <div className={`relative ${className}`}>
        {/* Premium dual-layer glow border */}
        <motion.div
          className="absolute -inset-[1px] rounded-lg"
          style={{
            background: `linear-gradient(135deg, ${color}00, ${color}40, ${color}80, ${color}40, ${color}00)`,
            padding: "1.5px",
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Premium glow aura */}
        <motion.div
          className="absolute -inset-[3px] rounded-lg"
          style={{
            background: `radial-gradient(ellipse at center, ${color}15 0%, transparent 70%)`,
            filter: "blur(4px)",
          }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Inner shine */}
        <motion.div
          className="absolute -inset-[1px] rounded-lg overflow-hidden"
          style={{ pointerEvents: "none" }}
        >
          <motion.div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, transparent 30%, ${color}20 50%, transparent 70%)`,
            }}
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
        <div className="relative rounded-lg" style={{ backgroundColor: `${color}08` }}>
          {children}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className={`relative rounded-lg ${className} cursor-pointer`}
      whileHover={{
        scale: 1.03,
        x: 3,
        boxShadow: `0 4px 16px ${color}15, 0 0 0 1px ${color}20`,
        transition: { type: "spring", stiffness: 300, damping: 20 },
      }}
      whileTap={{ scale: 0.98 }}
      style={{
        border: "1px solid",
        borderColor: `${color}10`,
      }}
      animate={{
        borderColor: [`${color}08`, `${color}18`, `${color}08`],
        boxShadow: [`0 0 0px ${color}00`, `0 0 8px ${color}10`, `0 0 0px ${color}00`],
      }}
      transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  )
}
