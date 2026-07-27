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

// Colors that work well on both light and dark backgrounds
const CHART_COLORS_RED_LIGHT = ["#DC2626", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899", "#14B8A6", "#F97316"]
const CHART_COLORS_RED_DARK = ["#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF", "#B794F4", "#FF85A1", "#64D8CB", "#FFA94D"]
const CHART_COLORS_GREEN_LIGHT = ["#059669", "#F59E0B", "#DC2626", "#3B82F6", "#8B5CF6", "#EC4899", "#14B8A6", "#F97316"]
const CHART_COLORS_GREEN_DARK = ["#34D399", "#FFD93D", "#FF6B6B", "#60A5FA", "#C084FC", "#F472B6", "#2DD4BF", "#FBBF24"]

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
  return (
    <ChartCard title={title} subtitle={subtitle}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
          <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} />
          <YAxis tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} />
          <Tooltip contentStyle={{ backgroundColor: "var(--surface-raised)", border: "1px solid var(--border-default)", borderRadius: 8, fontSize: 12 }} />
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
  return (
    <ChartCard title={title} subtitle={subtitle}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
          <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} />
          <YAxis tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} />
          <Tooltip contentStyle={{ backgroundColor: "var(--surface-raised)", border: "1px solid var(--border-default)", borderRadius: 8, fontSize: 12 }} />
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
  const defaultColors = useChartColors()
  const resolvedColors = colors ?? defaultColors
  return (
    <ChartCard title={title} subtitle={subtitle}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={donut ? 50 : 0} outerRadius={90} paddingAngle={2} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
            {data.map((_, i) => <Cell key={i} fill={resolvedColors[i % resolvedColors.length]} />)}
          </Pie>
          <Tooltip contentStyle={{ backgroundColor: "var(--surface-raised)", border: "1px solid var(--border-default)", borderRadius: 8, fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
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
  return (
    <ChartCard title={title} subtitle={subtitle}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
          <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} />
          <YAxis tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} />
          <Tooltip contentStyle={{ backgroundColor: "var(--surface-raised)", border: "1px solid var(--border-default)", borderRadius: 8, fontSize: 12 }} />
          <Area type="monotone" dataKey={dataKey} stroke={color} fill={color} fillOpacity={0.1} strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
