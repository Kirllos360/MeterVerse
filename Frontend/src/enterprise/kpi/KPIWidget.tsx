"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface KPIWidgetProps {
  title: string
  value: number
  unit?: string
  icon?: string
  trend?: "up" | "down" | "flat"
  trendValue?: string
  color?: string
  formatter?: (value: number) => string
  delay?: number
}

function useAnimatedValue(target: number, duration = 1000) {
  const [current, setCurrent] = useState(0)
  useEffect(() => {
    if (target === 0) return
    const start = performance.now()
    const animate = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCurrent(target * eased)
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [target, duration])
  return current
}

function TrendIcon({ trend }: { trend: "up" | "down" | "flat" }) {
  const colors = { up: "var(--status-success)", down: "var(--status-error)", flat: "#6B7280" }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors[trend]} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      {trend === "up" && <polyline points="18 15 12 9 6 15" />}
      {trend === "down" && <polyline points="6 9 12 15 18 9" />}
      {trend === "flat" && <line x1="6" y1="12" x2="18" y2="12" />}
    </svg>
  )
}

export function KPIWidget({ title, value, unit, trend, trendValue, color = "var(--brand)", formatter, delay = 0 }: KPIWidgetProps) {
  const animatedValue = useAnimatedValue(value)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="relative rounded-xl p-4 overflow-hidden"
      style={{
        backgroundColor: "var(--surface-raised)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-medium" style={{ color: "var(--text-tertiary)" }}>{title}</span>
        {trend && (
          <div className="flex items-center gap-1">
            <TrendIcon trend={trend} />
            {trendValue && <span className="text-[10px]" style={{ color: trend === "up" ? "var(--status-success)" : trend === "down" ? "var(--status-error)" : "#6B7280" }}>{trendValue}</span>}
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold tabular-nums" style={{ color }}>
          {formatter ? formatter(Math.round(animatedValue)) : Math.round(animatedValue).toLocaleString()}
        </span>
        {unit && <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>{unit}</span>}
      </div>
      {/* Bottom glow bar */}
      <motion.div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ backgroundColor: color }} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: delay + 0.3, duration: 0.6 }} />
    </motion.div>
  )
}

export function KPIWidgetGrid({ children, columns = 4 }: { children: React.ReactNode; columns?: number }) {
  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {children}
    </div>
  )
}

