"use client"

import { useState, useEffect } from "react"

interface LogEntry { id: string; timestamp: string; level: "error" | "warn" | "info" | "debug"; source: string; message: string }

const LEVELS: LogEntry["level"][] = ["error", "warn", "info", "debug"]
const LEVEL_COLORS = { error: "#DC2626", warn: "#D97706", info: "#3B82F6", debug: "#6B7280" }
const SOURCES = ["api-gateway", "auth-service", "billing-service", "meter-service"]
const MESSAGES = ["Request processed successfully", "Connection pool exhausted, retrying...", "Invoice #INV-001 generated", "Meter reading imported: 1234.56 kWh"]

export default function AdminLogsPage() {
  const [filter, setFilter] = useState<LogEntry["level"] | "all">("all")
  const [logs, setLogs] = useState<LogEntry[]>([])

  useEffect(() => {
    setLogs(Array.from({ length: 30 }, (_, i) => ({
      id: `log_${i}`, timestamp: new Date(Date.now() - i * 30000).toISOString(),
      level: LEVELS[i % 4], source: SOURCES[i % 4], message: MESSAGES[i % 4],
    })))
  }, [])

  const filtered = filter === "all" ? logs : logs.filter((l) => l.level === filter)

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-white">System Logs</h1>
        <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>Real-time log stream</p>
      </div>
      <div className="flex gap-2">
        {(["all", "error", "warn", "info", "debug"] as const).map((l) => (
          <button key={l} onClick={() => setFilter(l)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={{ backgroundColor: filter === l ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.05)", color: filter === l ? "#EF4444" : "rgba(255,255,255,0.5)" }}
          >{l}</button>
        ))}
      </div>
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "#1A1A1A", backgroundColor: "#0A0A0A" }}>
        <div className="max-h-96 overflow-y-auto font-mono text-xs">
          {filtered.map((log) => (
            <div key={log.id} className="flex items-start gap-2 px-3 py-1.5 border-b hover:bg-white/[0.02]" style={{ borderColor: "#1A1A1A" }}>
              <span className="w-16 shrink-0" style={{ color: "rgba(255,255,255,0.25)" }}>{new Date(log.timestamp).toLocaleTimeString()}</span>
              <span className="w-10 shrink-0 font-medium uppercase" style={{ color: LEVEL_COLORS[log.level] }}>{log.level}</span>
              <span className="w-28 shrink-0 truncate" style={{ color: "rgba(255,255,255,0.4)" }}>{log.source}</span>
              <span className="flex-1" style={{ color: "rgba(255,255,255,0.7)" }}>{log.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
