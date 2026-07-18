"use client"

import { type ReactNode } from "react"

type Status = "success" | "warning" | "error" | "info" | "pending"

const STATUS_COLORS: Record<Status, string> = {
  success: "#059669",
  warning: "#D97706",
  error: "#DC2626",
  info: "#3B82F6",
  pending: "#F59E0B",
}

export function StatusBorder({
  children,
  status,
  className = "",
}: {
  children: ReactNode
  status: Status
  className?: string
}) {
  const color = STATUS_COLORS[status]
  return (
    <div
      className={`relative rounded-xl ${className}`}
      style={{
        border: "1px solid",
        borderColor: color,
        boxShadow: `0 0 8px ${color}22`,
      }}
    >
      {children}
    </div>
  )
}

export function StatusBadge({ status, label }: { status: Status; label?: string }) {
  const color = STATUS_COLORS[status]
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
      style={{
        backgroundColor: `${color}18`,
        color,
        border: `1px solid ${color}40`,
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      {label || status}
    </span>
  )
}
