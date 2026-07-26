"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

const QUICK_ACTIONS = [
  { label: "Health", path: "/api/health", method: "GET" },
  { label: "DB Status", path: "/api/admin/health", method: "GET" },
  { label: "Meters", path: "/api/meters?limit=5", method: "GET" },
  { label: "Customers", path: "/api/customers?limit=5", method: "GET" },
  { label: "Invoices", path: "/api/invoices?limit=5", method: "GET" },
]

export function InspectorPanel({ collapsed, onToggleCollapse }: { collapsed: boolean; onToggleCollapse: () => void }) {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [responseTime, setResponseTime] = useState<number | null>(null)
  const [history, setHistory] = useState<{cmd: string; result: string; time: number; error?: boolean}[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }) }, [history])

  const execute = async (pathOverride?: string) => {
    const cmd = (pathOverride || input).trim()
    if (!cmd) return
    setInput("")
    const start = performance.now()
    try {
      const path = cmd.startsWith("/") ? cmd : "/api/" + cmd
      const res = await fetch(`http://localhost:3002${path}`, { headers: { Authorization: "Bearer dev", "X-Dev-Mode": "true" } })
      const text = await res.text()
      const elapsed = Math.round(performance.now() - start)
      setResponseTime(elapsed)
      try { setOutput(JSON.stringify(JSON.parse(text), null, 2).slice(0, 1500)) } catch { setOutput(text.slice(0, 1500)) }
      setHistory(p => [...p, { cmd, result: text.slice(0, 500), time: elapsed, error: !res.ok }])
    } catch (e: any) {
      setResponseTime(null)
      setHistory(p => [...p, { cmd, result: `Error: ${e.message}`, time: 0, error: true }])
    }
  }

  return (
    <motion.div className="flex flex-col h-full border-l" style={{ width: 360, borderColor: "var(--border-default)", backgroundColor: "var(--surface-raised)" }} layout>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b shrink-0" style={{ borderColor: "var(--border-default)" }}>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ backgroundColor: "var(--brand)" }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
          </div>
          <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>API Explorer</span>
          {responseTime !== null && <span className="text-[10px] font-mono" style={{ color: responseTime < 100 ? "#22C55E" : responseTime < 500 ? "#F59E0B" : "#EF4444" }}>{responseTime}ms</span>}
        </div>
        <button onClick={onToggleCollapse} className="text-xs p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors" style={{ color: "var(--text-tertiary)" }}>✕</button>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-1 px-3 py-2 border-b flex-wrap shrink-0" style={{ borderColor: "var(--border-default)" }}>
        {QUICK_ACTIONS.map(qa => (
          <button key={qa.path} onClick={() => execute(qa.path)}
            className="text-[10px] px-2 py-1 rounded-md font-medium transition-colors hover:opacity-80"
            style={{ backgroundColor: "var(--toolbar-surface)", color: "var(--toolbar-text)" }}>
            {qa.label}
          </button>
        ))}
      </div>

      {/* Output */}
      <div className="flex-1 overflow-y-auto p-3 font-mono text-[12px] space-y-2" style={{ backgroundColor: "#080808" }}>
        {history.length === 0 && (
          <div className="p-3 rounded-xl text-xs" style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p style={{ color: "var(--text-tertiary)" }}>Try a quick action above or type an API path</p>
          </div>
        )}
        <AnimatePresence>
          {history.map((h, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.03)" }}>
                <span style={{ color: "var(--brand)" }}>$</span>
                <span style={{ color: "var(--text-primary)" }} className="text-xs">{h.cmd}</span>
                <span className="ml-auto text-[10px] font-mono" style={{ color: h.time < 100 ? "#22C55E" : "#F59E0B" }}>{h.time}ms</span>
              </div>
              <div className={`px-3 py-2 rounded-lg whitespace-pre-wrap text-xs ${h.error ? "border" : ""}`} style={{ backgroundColor: "rgba(255,255,255,0.02)", borderColor: h.error ? "rgba(239,68,68,0.2)" : "transparent", color: h.error ? "#EF4444" : "var(--text-secondary)" }}>
                {h.result.length > 800 ? h.result.slice(0, 800) + "..." : h.result}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-1.5 p-3 border-t shrink-0" style={{ borderColor: "var(--border-default)" }}>
        <div className="flex-1 flex items-center gap-1.5 px-3 py-2 rounded-xl" style={{ backgroundColor: "#0A0A0A", border: "1px solid rgba(255,255,255,0.1)" }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && execute()}
            placeholder="/api/health" className="flex-1 bg-transparent outline-none text-xs font-mono" style={{ color: "#E0E0E0" }} />
        </div>
        <motion.button onClick={() => execute()} whileTap={{ scale: 0.95 }}
          className="px-4 py-2 rounded-xl text-xs font-medium text-white" style={{ backgroundColor: "var(--brand)" }}>
          Send
        </motion.button>
      </div>
    </motion.div>
  )
}
