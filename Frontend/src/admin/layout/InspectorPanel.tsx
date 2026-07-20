"use client"

import { useState } from "react"

export function InspectorPanel() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [history, setHistory] = useState<string[]>([])

  const execute = async () => {
    if (!input.trim()) return
    setHistory(p => [...p, input])
    try {
      // Try as API endpoint
      const res = await fetch(input.startsWith("http") ? input : `http://localhost:3001${input.startsWith("/") ? input : "/api/" + input}`)
      const data = await res.text()
      setOutput(data.substring(0, 2000))
    } catch (e: any) {
      setOutput(`Error: ${e.message}`)
    }
    setInput("")
  }

  return (
    <div className="flex flex-col h-full text-xs">
      <div className="flex items-center gap-2 px-3 py-1.5 border-b" style={{ borderColor: "var(--border-default)" }}>
        <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Inspector</span>
        <span style={{ color: "var(--text-tertiary)", fontSize: 10 }}>Run API queries or test code</span>
      </div>
      <div className="flex-1 overflow-y-auto p-2 font-mono text-[11px]" style={{ color: "var(--text-secondary)" }}>
        {history.map((h, i) => (
          <div key={i} className="mb-1">
            <span style={{ color: "var(--brand)" }}>❯ {h}</span>
          </div>
        ))}
        {output && <div className="whitespace-pre-wrap p-2 rounded" style={{ backgroundColor: "var(--surface-sunken)", color: "var(--text-primary)" }}>{output}</div>}
        {!history.length && <div style={{ color: "var(--text-tertiary)" }}>Type an API path (e.g., /api/health) and press Enter</div>}
      </div>
      <div className="flex gap-1 p-2 border-t" style={{ borderColor: "var(--border-default)" }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && execute()}
          placeholder="/api/health" className="flex-1 px-2 py-1 rounded text-xs font-mono outline-none"
          style={{ backgroundColor: "var(--surface-sunken)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }} />
        <button onClick={execute} className="px-3 py-1 rounded text-xs font-medium text-white" style={{ backgroundColor: "var(--brand)" }}>Run</button>
      </div>
    </div>
  )
}
