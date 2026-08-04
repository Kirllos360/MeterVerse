"use client"

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { useState, useEffect } from "react"

function useDarkMode() {
  const [isDark, setIsDark] = useState(false)
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"))
    check()
    const observer = new MutationObserver(check)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    return () => observer.disconnect()
  }, [])
  return isDark
}

function tooltipStyle(isDark: boolean): React.CSSProperties {
  return {
    backgroundColor: isDark ? "#1A1A1E" : "#FFFFFF",
    border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)",
    borderRadius: 12,
    color: isDark ? "#F2F2F5" : "#1C1C1E",
    fontSize: 12,
    boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.3)" : "0 4px 20px rgba(0,0,0,0.06)"
  }
}

function getBrandColor() {
  if (typeof document === "undefined") return "#DC2626"
  return getComputedStyle(document.documentElement).getPropertyValue("--brand").trim() || "#DC2626"
}

interface HorizontalBarCardProps {
  title: string
  subtitle?: string
  data: { name: string; value: number; color?: string }[]
  height?: number
}

export function HorizontalBarCard({ title, subtitle, data, height = 250 }: HorizontalBarCardProps) {
  const isDark = useDarkMode()
  const brand = getBrandColor()
  const colors = [brand, "#F39C12", "#C0392B", "#3498DB", "#8E44AD", "#E67E22", "#D35400"]
  const brightColors = ["#FF6B6B", "#FFD93D", "#FF8A80", "#5DADE2", "#AF7AC5", "#F5A623", "#F5B041"]
  const palette = isDark ? brightColors : colors
  // Replace first color with brand
  palette[0] = brand

  return (
    <div className="rounded-2xl border p-5" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{title}</h3>
          {subtitle && <p className="text-[11px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>{subtitle}</p>}
        </div>
      </div>
      <div style={{ width: "100%", height, backgroundColor: "transparent" }}>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data} layout="vertical" margin={{ top: 2, right: 10, left: 10, bottom: 2 }} style={{ backgroundColor: "transparent" }}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "var(--text-secondary)" }} width={90} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ ...tooltipStyle(isDark), backgroundColor: isDark ? "#1A1A1E" : "#FFFFFF" }} formatter={(value: number) => [value.toLocaleString(), ""]} />
            <Bar dataKey="value" radius={[0, 6, 6, 0]} background={{ fill: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)" }}>
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color || palette[index % palette.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// Also fix the PieChart to not have white background
// Export a universal ChartCard with transparent bg
export { ChartCard } from "./ChartComponents"
export { LineChartCard, BarChartCard, AreaChartCard } from "./ChartComponents"
