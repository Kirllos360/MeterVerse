"use client"

import { motion } from "framer-motion"
import { variants, transitions } from "@/design-system/motion"

type WidgetVariant = "kpi" | "metric" | "trend" | "progress" | "status" | "counter" | "health"

interface WidgetBase {
  label: string
  value?: string | number
  variant?: WidgetVariant
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  status?: "active" | "pending" | "error" | "inactive"
  progress?: number
}

export function Widget({ label, value, variant = "kpi", trend, trendValue, status, progress }: WidgetBase) {
  const trendColor = trend === "up" ? "#059669" : trend === "down" ? "#DC2626" : "#9CA3AF"
  const statusColor = status === "active" ? "#059669" : status === "pending" ? "#D97706" : status === "error" ? "#DC2626" : "#9CA3AF"

  return (
    <motion.div variants={variants.staggerItem} initial="initial" animate="animate"
      className="p-4 rounded-xl border" style={{ backgroundColor: "var(--surface-raised, #FFFFFF)", borderColor: "var(--border-default, #E5E5E5)" }}
    >
      <div className="text-[11px] mb-1" style={{ color: "var(--text-tertiary, #A3A3A3)" }}>{label}</div>

      {variant === "kpi" && (
        <div className="flex items-end gap-2">
          <span className="text-2xl font-bold" style={{ color: "var(--text-primary, #0A0A0A)" }}>{value ?? "—"}</span>
          {trend && (
            <span className="flex items-center gap-0.5 text-xs font-medium mb-1" style={{ color: trendColor }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d={trend === "up" ? "M18 15l-6-6-6 6" : trend === "down" ? "M6 9l6 6 6-6" : "M5 12h14"} />
              </svg>
              {trendValue}
            </span>
          )}
        </div>
      )}

      {variant === "progress" && (
        <div className="space-y-1">
          <span className="text-2xl font-bold" style={{ color: "var(--text-primary, #0A0A0A)" }}>{progress ?? 0}%</span>
          <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: "#E5E5E5" }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress ?? 0}%`, backgroundColor: "#00BFA5" }} />
          </div>
        </div>
      )}

      {variant === "status" && (
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColor }} />
          <span className="text-sm font-medium" style={{ color: statusColor }}>
            {status === "active" ? "Active" : status === "pending" ? "Pending" : status === "error" ? "Error" : "Inactive"}
          </span>
        </div>
      )}

      {variant === "counter" && (
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold" style={{ color: "var(--text-primary, #0A0A0A)" }}>{value ?? "—"}</span>
          <span className="text-xs" style={{ color: "var(--text-tertiary, #A3A3A3)" }}>total</span>
        </div>
      )}

      {variant === "health" && (
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: statusColor }} />
          <span className="text-sm font-medium" style={{ color: "var(--text-primary, #0A0A0A)" }}>{value ?? "—"}</span>
        </div>
      )}
    </motion.div>
  )
}
