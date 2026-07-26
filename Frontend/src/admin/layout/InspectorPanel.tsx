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

const STORAGE_KEY_TASKS = "mv-inspector-tasks"
const STORAGE_KEY_NOTES = "mv-inspector-notes"

export function InspectorPanel({ collapsed, onToggleCollapse }: { collapsed: boolean; onToggleCollapse: () => void }) {
  // Tab state
  const [tab, setTab] = useState<"api" | "tasks" | "notes">("api")

  // API Explorer
  const [input, setInput] = useState("")
  const [responseTime, setResponseTime] = useState<number | null>(null)
  const [history, setHistory] = useState<{cmd: string; result: string; time: number; error?: boolean}[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }) }, [history])

  // Tasks
  const [tasks, setTasks] = useState<{id: number; text: string; done: boolean}[]>([])
  const [taskInput, setTaskInput] = useState("")
  useEffect(() => { try { const saved = localStorage.getItem(STORAGE_KEY_TASKS); if (saved) setTasks(JSON.parse(saved)) } catch {} }, [])
  useEffect(() => { localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks)) }, [tasks])

  // Notes
  const [notes, setNotes] = useState<{id: number; text: string; date: string}[]>([])
  const [noteInput, setNoteInput] = useState("")
  useEffect(() => { try { const saved = localStorage.getItem(STORAGE_KEY_NOTES); if (saved) setNotes(JSON.parse(saved)) } catch {} }, [])
  useEffect(() => { localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(notes)) }, [notes])

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
      setHistory(p => [...p, { cmd, result: text.slice(0, 500), time: elapsed, error: !res.ok }])
    } catch (e: any) {
      setResponseTime(null)
      setHistory(p => [...p, { cmd, result: `Error: ${e.message}`, time: 0, error: true }])
    }
  }

  const addTask = () => {
    if (!taskInput.trim()) return
    setTasks([...tasks, { id: Date.now(), text: taskInput.trim(), done: false }])
    setTaskInput("")
  }

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  const deleteTask = (id: number) => {
    setTasks(tasks.filter(t => t.id !== id))
  }

  const addNote = () => {
    if (!noteInput.trim()) return
    setNotes([{ id: Date.now(), text: noteInput.trim(), date: new Date().toLocaleDateString() }, ...notes])
    setNoteInput("")
  }

  const deleteNote = (id: number) => {
    setNotes(notes.filter(n => n.id !== id))
  }

  const TABS = [
    { id: "api" as const, label: "API" },
    { id: "tasks" as const, label: "Tasks" },
    { id: "notes" as const, label: "Notes" },
  ]

  return (
    <motion.div className="flex flex-col h-full overflow-hidden rounded-xl border" style={{ borderColor: "var(--border-default)", backgroundColor: "var(--sidebar-background)" }} layout>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b shrink-0" style={{ borderColor: "var(--border-default)" }}>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 flex items-center justify-center" style={{ backgroundColor: "var(--brand)" }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
          </div>
          <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>Inspector</span>
          {responseTime !== null && <span className="text-[10px] font-mono" style={{ color: responseTime < 100 ? "#22C55E" : responseTime < 500 ? "#F59E0B" : "#EF4444" }}>{responseTime}ms</span>}
        </div>
        <button onClick={onToggleCollapse} className="text-xs p-1 rounded transition-colors" style={{ color: "var(--text-tertiary)" }}>✕</button>
      </div>

      {/* Tabs */}
      <div className="flex border-b shrink-0" style={{ borderColor: "var(--border-default)" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex-1 py-1.5 text-[11px] font-medium transition-colors"
            style={{ color: tab === t.id ? "var(--brand)" : "var(--text-tertiary)", borderBottom: tab === t.id ? "2px solid var(--brand)" : "2px solid transparent" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === "api" && (
        <>
          {/* Quick Actions */}
          <div className="flex gap-1 px-3 py-2 border-b flex-wrap shrink-0" style={{ borderColor: "var(--border-default)" }}>
            {QUICK_ACTIONS.map(qa => (
              <button key={qa.path} onClick={() => execute(qa.path)}
                className="text-[10px] px-2 py-1 font-medium transition-colors hover:opacity-80" style={{ backgroundColor: "var(--toolbar-surface)", color: "var(--toolbar-text)" }}>
                {qa.label}
              </button>
            ))}
          </div>

          {/* Output */}
          <div className="flex-1 overflow-y-auto p-3 font-mono text-[12px] space-y-2" style={{ backgroundColor: "#080808" }}>
            {history.length === 0 && (
              <div className="p-3 text-xs" style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <p style={{ color: "var(--text-tertiary)" }}>Try a quick action or type an API path</p>
              </div>
            )}
            <AnimatePresence>
              {history.map((h, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
                  <div className="flex items-center gap-2 px-3 py-1.5" style={{ backgroundColor: "rgba(255,255,255,0.03)" }}>
                    <span style={{ color: "var(--brand)" }}>$</span>
                    <span style={{ color: "var(--text-primary)" }} className="text-xs">{h.cmd}</span>
                    <span className="ml-auto text-[10px] font-mono" style={{ color: h.time < 100 ? "#22C55E" : "#F59E0B" }}>{h.time}ms</span>
                  </div>
                  <div className={`px-3 py-2 whitespace-pre-wrap text-xs ${h.error ? "border" : ""}`} style={{ backgroundColor: "rgba(255,255,255,0.02)", borderColor: h.error ? "rgba(239,68,68,0.2)" : "transparent", color: h.error ? "#EF4444" : "var(--text-secondary)" }}>
                    {h.result.length > 800 ? h.result.slice(0, 800) + "..." : h.result}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex gap-1.5 p-3 border-t shrink-0" style={{ borderColor: "var(--border-default)" }}>
            <div className="flex-1 flex items-center gap-1.5 px-3 py-2" style={{ backgroundColor: "#0A0A0A", border: "1px solid rgba(255,255,255,0.1)" }}>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && execute()}
                placeholder="/api/health" className="flex-1 bg-transparent outline-none text-xs font-mono" style={{ color: "#E0E0E0" }} />
            </div>
            <motion.button onClick={() => execute()} whileTap={{ scale: 0.95 }}
              className="px-4 py-2 text-xs font-medium text-white" style={{ backgroundColor: "var(--brand)" }}>
              Send
            </motion.button>
          </div>
        </>
      )}

      {tab === "tasks" && (
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {tasks.length === 0 && (
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>No tasks yet. Add one below.</p>
            )}
            {tasks.map(t => (
              <motion.div key={t.id} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 px-2 py-1.5" style={{ borderBottom: "1px solid var(--border-default)" }}>
                <input type="checkbox" checked={t.done} onChange={() => toggleTask(t.id)}
                  className="w-3 h-3 accent-[var(--brand)] shrink-0" />
                <span className={`flex-1 text-xs ${t.done ? "line-through" : ""}`} style={{ color: t.done ? "var(--text-tertiary)" : "var(--text-primary)" }}>{t.text}</span>
                <button onClick={() => deleteTask(t.id)} className="text-[10px] opacity-40 hover:opacity-100" style={{ color: "var(--brand)" }}>✕</button>
              </motion.div>
            ))}
          </div>
          <div className="flex gap-1.5 p-3 border-t shrink-0" style={{ borderColor: "var(--border-default)" }}>
            <input value={taskInput} onChange={e => setTaskInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addTask()}
              placeholder="Add task..." className="flex-1 px-2 py-1.5 text-xs outline-none" style={{ backgroundColor: "var(--toolbar-surface)", border: "1px solid var(--border-default)" }} />
            <button onClick={addTask} className="px-3 py-1.5 text-xs font-medium text-white" style={{ backgroundColor: "var(--brand)" }}>+</button>
          </div>
        </div>
      )}

      {tab === "notes" && (
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {notes.length === 0 && (
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>No notes yet. Add one below.</p>
            )}
            {notes.map(n => (
              <motion.div key={n.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="p-2 text-xs" style={{ backgroundColor: "var(--toolbar-surface)", border: "1px solid rgba(220,38,38,0.15)" }}>
                <div className="flex justify-between items-start gap-2">
                  <p style={{ color: "var(--text-primary)" }}>{n.text}</p>
                  <button onClick={() => deleteNote(n.id)} className="text-[10px] shrink-0 opacity-40 hover:opacity-100" style={{ color: "var(--brand)" }}>✕</button>
                </div>
                <p className="text-[9px] mt-1 opacity-50" style={{ color: "var(--text-tertiary)" }}>{n.date}</p>
              </motion.div>
            ))}
          </div>
          <div className="flex gap-1.5 p-3 border-t shrink-0" style={{ borderColor: "var(--border-default)" }}>
            <input value={noteInput} onChange={e => setNoteInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addNote()}
              placeholder="Add note..." className="flex-1 px-2 py-1.5 text-xs outline-none" style={{ backgroundColor: "var(--toolbar-surface)", border: "1px solid var(--border-default)" }} />
            <button onClick={addNote} className="px-3 py-1.5 text-xs font-medium text-white" style={{ backgroundColor: "var(--brand)" }}>+</button>
          </div>
        </div>
      )}
    </motion.div>
  )
}


