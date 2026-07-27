"use client"

import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

interface AnalyticsBarProps {
  title: string
  data1: { name: string; value: number }[]
  data2: { name: string; value: number }[]
  data3: { name: string; value: number }[]
  brandColor?: string
}

const PIE_COLORS = ["var(--brand)", "var(--brand)", "#F59E0B", "#10B981"]

export function AnalyticsBar({ title, data1, data2, data3, brandColor = "var(--brand)" }: AnalyticsBarProps) {
  const labelClass = "text-[10px] font-medium mb-1.5 block"
  return (
    <div
      className="rounded-2xl border p-4"
      style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}
    >
      <h3 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>{title}</h3>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <span className={labelClass} style={{ color: "var(--text-tertiary)" }}>Trend</span>
          <ResponsiveContainer width="100%" height={80}>
            <LineChart data={data1}>
              <Line type="monotone" dataKey="value" stroke={brandColor} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div>
          <span className={labelClass} style={{ color: "var(--text-tertiary)" }}>Distribution</span>
          <ResponsiveContainer width="100%" height={80}>
            <BarChart data={data2}>
              <Bar dataKey="value" fill={brandColor} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div>
          <span className={labelClass} style={{ color: "var(--text-tertiary)" }}>Breakdown</span>
          <ResponsiveContainer width="100%" height={80}>
            <PieChart>
              <Pie data={data3} cx="50%" cy="50%" innerRadius={20} outerRadius={32} paddingAngle={2} dataKey="value">
                {data3.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
