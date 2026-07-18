"use client"

import { type ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { futuristic, duration, transitions } from "@/design-system/motion"

function GlowBorder({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      animate={futuristic.glowPulse.animate}
      className={`relative rounded-xl ${className}`}
      style={{ border: "1px solid rgba(0,191,165,0.2)" }}
    >
      {children}
    </motion.div>
  )
}

function WaveButton({
  children,
  onClick,
  className = "",
  ...props
}: {
  children: ReactNode
  onClick?: () => void
  className?: string
  [key: string]: unknown
}) {
  return (
    <motion.button
      whileHover={futuristic.waveButton.whileHover}
      whileTap={futuristic.waveButton.whileTap}
      onClick={onClick}
      className={`relative overflow-hidden rounded-lg px-4 py-2 text-sm font-medium text-white ${className}`}
      style={{ backgroundColor: "#00BFA5" }}
      {...props}
    >
      <motion.span
        className="absolute inset-0 rounded-lg"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.15), transparent)",
        }}
        whileHover={{ opacity: [0, 0.3, 0], transition: { duration: 0.6 } }}
      />
      {children}
    </motion.button>
  )
}

function PageTransition({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial={futuristic.pageEntrance.initial}
      animate={futuristic.pageEntrance.animate}
      exit={{ opacity: 0, y: -20, scale: 0.97, filter: "blur(4px)", transition: { duration: duration.slow } }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function ProgressGlow({ value = 0, className = "" }: { value?: number; className?: string }) {
  return (
    <div className={`relative h-2 w-full overflow-hidden rounded-full ${className}`} style={{ backgroundColor: "rgba(0,191,165,0.1)" }}>
      <motion.div
        className="absolute inset-y-0 left-0 rounded-full"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        animate={futuristic.progressGlow.animate}
      />
    </div>
  )
}

function NotificationBadge({ count = 0, className = "" }: { count?: number; className?: string }) {
  if (count <= 0) return null
  return (
    <motion.span
      animate={futuristic.notificationPulse.animate}
      className={`inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white ${className}`}
      style={{ backgroundColor: "#00BFA5", minWidth: 18, height: 18 }}
    >
      {count > 99 ? "99+" : count}
    </motion.span>
  )
}

function ShimmerCard({ className = "" }: { className?: string }) {
  return (
    <motion.div
      animate={futuristic.shimmer.animate}
      className={`rounded-xl border p-4 ${className}`}
      style={{
        borderColor: "var(--border-default, #E5E5E5)",
        backgroundColor: "var(--surface-raised, #FFFFFF)",
        backgroundImage: "linear-gradient(90deg, transparent 0%, rgba(0,191,165,0.04) 50%, transparent 100%)",
        backgroundSize: "200% 100%",
      }}
    >
      <div className="mb-3 h-3 w-2/3 rounded" style={{ backgroundColor: "var(--border-default, #E5E5E5)" }} />
      <div className="mb-2 h-8 w-1/2 rounded" style={{ backgroundColor: "var(--border-default, #E5E5E5)" }} />
      <div className="h-3 w-1/3 rounded" style={{ backgroundColor: "var(--border-default, #E5E5E5)" }} />
    </motion.div>
  )
}

export { GlowBorder, WaveButton, PageTransition, ProgressGlow, NotificationBadge, ShimmerCard, AnimatePresence }
