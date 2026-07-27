"use client"

import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
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

// Shared tooltip style that adapts to dark/light mode
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

function useIsGreen() {
  const [isGreen, setIsGreen] = useState(false)
  useEffect(() => {
    const check = () => setIsGreen(getComputedStyle(document.documentElement).getPropertyValue("--brand").trim() === "#059669")
    check()
    const observer = new MutationObserver(check)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["style"] })
    return () => observer.disconnect()
  }, [])
  return isGreen
}

// Professional color palettes — harmonious and accessible
const CHART_COLORS_RED_LIGHT = ["#E74C3C", "#F39C12", "#2ECC71", "#3498DB", "#9B59B6", "#1ABC9C", "#E67E22", "#2980B9"]
const CHART_COLORS_RED_DARK = ["#E74C3C", "#F1C40F", "#2ECC71", "#5DADE2", "#AF7AC5", "#48C9B0", "#F5B041", "#85C1E9"]
const CHART_COLORS_GREEN_LIGHT = ["#059669", "#F59E0B", "#DC2626", "#3B82F6", "#8B5CF6", "#14B8A6", "#E67E22", "#6366F1"]
const CHART_COLORS_GREEN_DARK = ["#34D399", "#FBBF24", "#F87171", "#60A5FA", "#A78BFA", "#2DD4BF", "#FCD34D", "#818CF8"]

function useChartColors() {
  const isDark = useDarkMode()
  const isGreen = useIsGreen()
  if (isGreen) return isDark ? CHART_COLORS_GREEN_DARK : CHART_COLORS_GREEN_LIGHT
  return isDark ? CHART_COLORS_RED_DARK : CHART_COLORS_RED_LIGHT
}

interface ChartCardProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  className?: string
  brandColor?: string
}

export function ChartCard({ title, subtitle, children, className = "", brandColor }: ChartCardProps) {
  return (
    <div className={`rounded-2xl border p-5 ${className}`} style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{title}</h3>
          {subtitle && <p className="text-[11px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  )
}

interface LineChartCardProps {
  title: string
  subtitle?: string
  data: any[]
  dataKey: string
  xKey?: string
  color?: string
  height?: number
}

export function LineChartCard({ title, subtitle, data, dataKey, xKey = "name", color = "var(--brand)", height = 250 }: LineChartCardProps) {
  const isDark = useDarkMode()
  return (
    <ChartCard title={title} subtitle={subtitle}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
          <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} axisLine={{ stroke: "var(--border-default)" }} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle(isDark)} />
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

interface BarChartCardProps {
  title: string
  subtitle?: string
  data: any[]
  dataKey: string
  xKey?: string
  color?: string
  height?: number
}

export function BarChartCard({ title, subtitle, data, dataKey, xKey = "name", color = "var(--brand)", height = 250 }: BarChartCardProps) {
  const isDark = useDarkMode()
  return (
    <ChartCard title={title} subtitle={subtitle}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" vertical={false} />
          <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} axisLine={{ stroke: "var(--border-default)" }} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle(isDark)} />
          <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

interface PieChartCardProps {
  title: string
  subtitle?: string
  data: { name: string; value: number }[]
  height?: number
  colors?: string[]
  donut?: boolean
}

export function PieChartCard({ title, subtitle, data, height = 250, colors, donut = false }: PieChartCardProps) {
  const isDark = useDarkMode()
  const defaultColors = useChartColors()
  const resolvedColors = colors ?? defaultColors
  return (
    <ChartCard title={title} subtitle={subtitle}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={donut ? 50 : 0} outerRadius={Math.min(height * 0.35, 90)} paddingAngle={2} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
            {data.map((_, i) => <Cell key={i} fill={resolvedColors[i % resolvedColors.length]} />)}
          </Pie>
          <Tooltip contentStyle={tooltipStyle(isDark)} />
          <Legend wrapperStyle={{ fontSize: 11, color: isDark ? "#F2F2F5" : "#1C1C1E" }} />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

interface AreaChartCardProps {
  title: string
  subtitle?: string
  data: any[]
  dataKey: string
  xKey?: string
  color?: string
  height?: number
}

export function AreaChartCard({ title, subtitle, data, dataKey, xKey = "name", color = "var(--brand)", height = 250 }: AreaChartCardProps) {
  const isDark = useDarkMode()
  return (
    <ChartCard title={title} subtitle={subtitle}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
          <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} axisLine={{ stroke: "var(--border-default)" }} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle(isDark)} />
          <Area type="monotone" dataKey={dataKey} stroke={color} fill={color} fillOpacity={0.1} strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
