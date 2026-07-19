"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface LogEntry {
  id: string
  timestamp: string
  level: "error" | "warn" | "info" | "debug"
  source: string
  message: string
  details?: string
}

interface LogViewerProps {
  logs: LogEntry[]
  maxHeight?: number
}

const levelColors: Record<string, string> = {
  error: "var(--status-error)", warn: "var(--status-warning)", info: "#3B82F6", debug: "#6B7280",
}

const levelDots: Record<string, string> = {
  error: "M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  warn: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z",
  info: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  debug: "M20 12H4",
}

export function LogViewer({ logs, maxHeight = 400 }: LogViewerProps) {
  const [filter, setFilter] = useState<string>("all")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (filter === "all") return logs
    return logs.filter((l) => l.level === filter)
  }, [logs, filter])

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: logs.length, error: 0, warn: 0, info: 0, debug: 0 }
    logs.forEach((l) => c[l.level]++)
    return c
  }, [logs])

  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--border-default)" }}>
      <div className="flex items-center gap-1.5 px-3 py-2 border-b overflow-x-auto" style={{ borderColor: "var(--border-default)", backgroundColor: "var(--surface-raised)" }}>
        {Object.entries(counts).map(([key, count]) => (
          <button key={key} onClick={() => setFilter(key)}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-colors whitespace-nowrap"
            style={{
              backgroundColor: filter === key ? "rgba(var(--brand-primary-rgb), 0.1)" : "transparent",
              color: filter === key ? "var(--brand-primary)" : "var(--text-secondary)",
            }}
          >
            {key !== "all" && <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: levelColors[key] }} />}
            {key} ({count})
          </button>
        ))}
      </div>
      <div className="overflow-y-auto font-mono" style={{ maxHeight }}>
        {filtered.length === 0 ? (
          <div className="p-4 text-center text-xs" style={{ color: "var(--text-tertiary)" }}>No logs match filter</div>
        ) : filtered.map((log) => (
          <div key={log.id}>
            <button onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
              className="flex items-start gap-2 w-full px-3 py-1.5 text-left hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors border-b"
              style={{ borderColor: "var(--border-default)" }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={levelColors[log.level]} strokeWidth="2" className="mt-0.5 shrink-0"><path d={levelDots[log.level]} /></svg>
              <span className="text-[10px] w-28 shrink-0" style={{ color: "var(--text-tertiary)" }}>{log.timestamp}</span>
              <span className="text-[10px] w-16 shrink-0 font-medium uppercase" style={{ color: levelColors[log.level] }}>{log.level}</span>
              <span className="text-[10px] w-20 shrink-0 truncate" style={{ color: "var(--text-secondary)" }}>{log.source}</span>
              <span className="text-[11px] flex-1 truncate" style={{ color: "var(--text-primary)" }}>{log.message}</span>
            </button>
            <AnimatePresence>
              {expandedId === log.id && log.details && (
                <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                  <pre className="px-3 py-2 text-[10px] leading-relaxed" style={{ backgroundColor: "var(--surface-sunken)", color: "var(--text-secondary)" }}>{log.details}</pre>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  )
}
