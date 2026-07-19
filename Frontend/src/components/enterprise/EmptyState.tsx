"use client"

import { motion } from "framer-motion"

interface EmptyStateProps {
  icon?: "noData" | "search" | "error" | "permission" | "offline"
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
}

const icons: Record<string, { viewBox: string; path: string }> = {
  noData: {
    viewBox: "0 0 24 24",
    path: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  },
  search: {
    viewBox: "0 0 24 24",
    path: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  },
  error: {
    viewBox: "0 0 24 24",
    path: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z",
  },
  permission: {
    viewBox: "0 0 24 24",
    path: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
  },
  offline: {
    viewBox: "0 0 24 24",
    path: "M18.364 5.636a9 9 0 010 12.728m-2.829-2.829a5 5 0 000-7.07m-4.243 4.243a1 1 0 010-1.414M12 17h.01M3 3l18 18",
  },
}

export function EmptyState({ icon = "noData", title, description, action }: EmptyStateProps) {
  const svg = icons[icon]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-8 text-center"
    >
      <div className="w-12 h-12 mb-4 flex items-center justify-center" style={{ color: "var(--text-tertiary)" }}>
        <svg width="24" height="24" viewBox={svg.viewBox} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d={svg.path} />
        </svg>
      </div>
      <h3 className="text-base font-semibold mb-1" style={{ color: "var(--text-primary)" }}>{title}</h3>
      {description && (
        <p className="text-sm max-w-xs" style={{ color: "var(--text-secondary)" }}>{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-4 py-2 rounded text-sm font-medium text-white transition-colors hover:opacity-90"
          style={{ backgroundColor: "var(--brand)" }}
        >
          {action.label}
        </button>
      )}
    </motion.div>
  )
}
