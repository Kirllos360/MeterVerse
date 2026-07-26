"use client"

import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

const CHART_COLORS = ["#DC2626", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899", "#14B8A6", "#F97316"]
const CHART_COLORS_GREEN = ["#059669", "#F59E0B", "#DC2626", "#3B82F6", "#8B5CF6", "#EC4899", "#14B8A6", "#F97316"]

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

export function LineChartCard({ title, subtitle, data, dataKey, xKey = "name", color = "#DC2626", height = 250 }: LineChartCardProps) {
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

export function BarChartCard({ title, subtitle, data, dataKey, xKey = "name", color = "#DC2626", height = 250 }: BarChartCardProps) {
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

export function PieChartCard({ title, subtitle, data, height = 250, colors = CHART_COLORS, donut = false }: PieChartCardProps) {
  return (
    <ChartCard title={title} subtitle={subtitle}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={donut ? 50 : 0} outerRadius={90} paddingAngle={2} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
            {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
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

export function AreaChartCard({ title, subtitle, data, dataKey, xKey = "name", color = "#DC2626", height = 250 }: AreaChartCardProps) {
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
