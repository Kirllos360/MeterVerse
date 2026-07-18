"use client"

import { useMemo } from "react"
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  PieChart, Pie, Cell, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts"

export type ChartType = "line" | "bar" | "area" | "pie" | "donut" | "gauge"

interface Series {
  name: string
  data: { x: string | number; y: number }[]
  color?: string
}

interface ChartsRuntimeProps {
  type: ChartType
  series: Series[]
  height?: number
  showLegend?: boolean
  showGrid?: boolean
}

const COLORS = ["#00BFA5", "#6366F1", "#F59E0B", "#EC4899", "#8B5CF6", "#14B8A6", "#F97316", "#06B6D4"]

export function ChartsRuntime({ type, series, height = 280, showLegend = false, showGrid = true }: ChartsRuntimeProps) {
  const chartData = useMemo(() => {
    if (type === "pie" || type === "donut") {
      return series[0]?.data.map((d) => ({ name: d.x, value: d.y })) ?? []
    }
    // Combine all series into one dataset
    const allKeys = new Set<string>()
    series.forEach((s) => s.data.forEach((d) => allKeys.add(String(d.x))))
    return Array.from(allKeys).map((key) => {
      const point: Record<string, string | number> = { name: key }
      series.forEach((s) => {
        const match = s.data.find((d) => String(d.x) === key)
        point[s.name] = match?.y ?? 0
      })
      return point
    })
  }, [series, type])

  const renderChart = () => {
    switch (type) {
      case "line":
        return (
          <LineChart data={chartData}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />}
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#A3A3A3" }} />
            <YAxis tick={{ fontSize: 11, fill: "#A3A3A3" }} />
            <Tooltip />
            {series.map((s, i) => (
              <Line key={s.name} type="monotone" dataKey={s.name} stroke={s.color || COLORS[i % COLORS.length]} strokeWidth={2} dot={false} />
            ))}
          </LineChart>
        )
      case "bar":
        return (
          <BarChart data={chartData}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />}
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#A3A3A3" }} />
            <YAxis tick={{ fontSize: 11, fill: "#A3A3A3" }} />
            <Tooltip />
            {series.map((s, i) => (
              <Bar key={s.name} dataKey={s.name} fill={s.color || COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        )
      case "area":
        return (
          <AreaChart data={chartData}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />}
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#A3A3A3" }} />
            <YAxis tick={{ fontSize: 11, fill: "#A3A3A3" }} />
            <Tooltip />
            {series.map((s, i) => (
              <Area key={s.name} type="monotone" dataKey={s.name} stroke={s.color || COLORS[i % COLORS.length]} fill={s.color || COLORS[i % COLORS.length]} fillOpacity={0.1} strokeWidth={2} />
            ))}
          </AreaChart>
        )
      case "pie":
      case "donut":
        return (
          <PieChart>
            <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={type === "donut" ? 50 : 0} paddingAngle={2}>
              {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        )
      case "gauge": {
        const val = series[0]?.data[0]?.y ?? 0
        const pct = Math.min(100, Math.max(0, val))
        return (
          <div className="flex flex-col items-center justify-center w-full" style={{ height }}>
            <svg width="160" height="160" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r="65" fill="none" stroke="#E5E5E5" strokeWidth="12" />
              <circle cx="80" cy="80" r="65" fill="none" stroke="#00BFA5" strokeWidth="12"
                strokeDasharray={`${(pct / 100) * 408.4} 408.4`} transform="rotate(-90, 80, 80)" strokeLinecap="round" />
              <text x="80" y="75" textAnchor="middle" fontSize="28" fontWeight="bold" fill="var(--text-primary, #0A0A0A)">{pct}%</text>
              <text x="80" y="95" textAnchor="middle" fontSize="11" fill="var(--text-tertiary, #A3A3A3)">{series[0]?.name || ""}</text>
            </svg>
          </div>
        )
      }
    }
  }

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        {renderChart()}
      </ResponsiveContainer>
    </div>
  )
}
