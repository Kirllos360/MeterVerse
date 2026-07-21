"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

export function InspectorPanel({ collapsed, onToggleCollapse }: { collapsed: boolean; onToggleCollapse: () => void }) {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [history, setHistory] = useState<{cmd: string; result: string; error?: boolean}[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }) }, [history])

  const execute = async () => {
    if (!input.trim()) return
    const cmd = input
    setInput("")
    try {
      const path = cmd.startsWith("/") ? cmd : "/api/" + cmd
      const res = await fetch(`http://localhost:3001${path}`, { headers: { Authorization: "Bearer test" } })
      const text = await res.text()
      const result = text.substring(0, 1500)
      setHistory(p => [...p, { cmd, result, error: !res.ok }])
      setOutput(result)
    } catch (e: any) {
      setHistory(p => [...p, { cmd, result: `Error: ${e.message}`, error: true }])
    }
  }

  return (
    <motion.div className="flex flex-col h-full" layout animate={{ width: collapsed ? 48 : "100%" }} transition={{ duration: 0.2 }}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b shrink-0" style={{ borderColor: "var(--border-default)" }}>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ backgroundColor: "var(--admin-accent)" }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
          </div>
          {!collapsed && <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>Inspector</span>}
        </div>
        <button onClick={onToggleCollapse} className="text-xs" style={{ color: "var(--text-tertiary)", background: "none", border: "none", cursor: "pointer" }}>
          {collapsed ? "◀" : "▶"}
        </button>
      </div>

      {!collapsed && <>
        {/* Output */}
        <div className="flex-1 overflow-y-auto p-3 font-mono text-[12px] space-y-2" style={{ backgroundColor: "#080808" }}>
          {history.length === 0 && (
            <div className="flex items-center gap-2 p-3 rounded-xl text-xs" style={{ backgroundColor: "rgba(var(--semantic-error-rgb), 0.05)", border: "1px solid rgba(var(--semantic-error-rgb), 0.08)" }}>
              <span className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px]" style={{ backgroundColor: "var(--admin-accent)", color: "white" }}>❯</span>
              <span style={{ color: "var(--text-tertiary)" }}>Type an API path (e.g., <span style={{ color: "var(--admin-accent)" }}>/api/health</span>) and press Enter</span>
            </div>
          )}
          <AnimatePresence>
            {history.map((h, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-1">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.03)" }}>
                  <span style={{ color: "var(--admin-accent)" }}>$</span>
                  <span style={{ color: "var(--text-primary)" }}>{h.cmd}</span>
                </div>
                <div className={`px-3 py-2 rounded-lg whitespace-pre-wrap ${h.error ? "border" : ""}`} style={{ backgroundColor: "rgba(255,255,255,0.02)", borderColor: h.error ? "rgba(239,68,68,0.2)" : "transparent", color: h.error ? "#EF4444" : "var(--text-secondary)" }}>
                  {h.result.substring(0, 800)}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex gap-1.5 p-3 border-t shrink-0" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="flex-1 flex items-center gap-1.5 px-3 py-2 rounded-xl" style={{ backgroundColor: "#0A0A0A", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.3)" }}>
            <span style={{ color: "var(--admin-accent)", fontSize: 12, fontWeight: 600 }}>$</span>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && execute()}
              placeholder="/api/health" className="flex-1 bg-transparent outline-none text-xs font-mono" style={{ color: "#E0E0E0" }} />
          </div>
          <motion.button onClick={execute} initial={{ boxShadow: "0 0 0px rgba(220,38,38,0)" }} whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(220,38,38,0.3)" }} whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-xl text-xs font-medium text-white" style={{ backgroundColor: "var(--admin-accent)" }}>
            Run
          </motion.button>
        </div>
      </>}
    </motion.div>
  )
}
