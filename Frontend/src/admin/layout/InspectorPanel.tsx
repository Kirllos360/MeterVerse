"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChatTab } from "@/features/chat/ChatTab"

const QUICK_ACTIONS = [
  { label: "Health", path: "/api/health" },
  { label: "DB Status", path: "/api/admin/health" },
  { label: "Meters", path: "/api/meters?limit=5" },
  { label: "Customers", path: "/api/customers?limit=5" },
  { label: "Invoices", path: "/api/invoices?limit=5" },
]

const STORAGE_KEY_TASKS = "mv-inspector-tasks"
const STORAGE_KEY_NOTES = "mv-inspector-notes"

const waveAnim = { scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7], transition: { repeat: Infinity, duration: 2.5, ease: "easeInOut" } }

// Connection status signal component
function ConnectionSignal() {
  const [status, setStatus] = useState<"online" | "degraded" | "offline">("online")
  useEffect(() => {
    const check = () => fetch("/api/health").then(r => setStatus(r.ok ? "online" : "degraded")).catch(() => setStatus("offline"))
    check()
    const interval = setInterval(check, 30000)
    return () => clearInterval(interval)
  }, [])
  return (
    <div className="flex items-center gap-1.5">
      <motion.span animate={status === "online" ? {} : { opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 2 }}
        className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: status === "online" ? "#22C55E" : status === "degraded" ? "#F59E0B" : "#EF4444" }} />
      <span className="text-[9px] font-semibold capitalize" style={{ color: "var(--text-tertiary)" }}>{status}</span>
    </div>
  )
}

export function InspectorPanel({ collapsed, onToggleCollapse }: { collapsed: boolean; onToggleCollapse: () => void }) {
  const [tab, setTab] = useState<"api" | "tasks" | "notes" | "chat">("api")
  const [input, setInput] = useState("")
  const [responseTime, setResponseTime] = useState<number | null>(null)
  const [history, setHistory] = useState<{cmd: string; result: string; time: number; error?: boolean}[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }) }, [history])

  const [tasks, setTasks] = useState<{id: number; text: string; done: boolean}[]>([])
  const [taskInput, setTaskInput] = useState("")
  useEffect(() => { try { const s = localStorage.getItem(STORAGE_KEY_TASKS); if (s) setTasks(JSON.parse(s)) } catch {} }, [])
  useEffect(() => { localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks)) }, [tasks])

  const [notes, setNotes] = useState<{id: number; text: string; date: string}[]>([])
  const [noteInput, setNoteInput] = useState("")
  useEffect(() => { try { const s = localStorage.getItem(STORAGE_KEY_NOTES); if (s) setNotes(JSON.parse(s)) } catch {} }, [])
  useEffect(() => { localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(notes)) }, [notes])

  const execute = async (p?: string) => {
    const cmd = (p || input).trim()
    if (!cmd) return; setInput(""); const start = performance.now()
    try {
      const path = cmd.startsWith("/") ? cmd : "/api/" + cmd
      const res = await fetch("http://localhost:3002" + path, { headers: { Authorization: "Bearer dev", "X-Dev-Mode": "true" } })
      const text = await res.text(); const elapsed = Math.round(performance.now() - start)
      setResponseTime(elapsed); setHistory(h => [...h, { cmd, result: text.slice(0, 500), time: elapsed, error: !res.ok }])
    } catch (e: any) { setResponseTime(null); setHistory(h => [...h, { cmd, result: "Error: " + e.message, time: 0, error: true }]) }
  }

  const addTask = () => { if (!taskInput.trim()) return; setTasks(t => [...t, { id: Date.now(), text: taskInput.trim(), done: false }]); setTaskInput("") }
  const toggleTask = (id: number) => setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t))
  const deleteTask = (id: number) => setTasks(tasks.filter(t => t.id !== id))
  const addNote = () => { if (!noteInput.trim()) return; setNotes(n => [{ id: Date.now(), text: noteInput.trim(), date: new Date().toLocaleDateString() }, ...n]); setNoteInput("") }
  const deleteNote = (id: number) => setNotes(notes.filter(n => n.id !== id))

  // Collapsed mode — narrow version
  if (collapsed) {
    return (
      <motion.div layout className="h-full flex flex-col items-center overflow-hidden rounded-2xl border py-3 gap-3"
        style={{ backgroundColor: "var(--sidebar-background)", borderColor: "var(--border-default)", width: 52 }}>
        
        <motion.button onClick={onToggleCollapse} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: "var(--toolbar-surface)", color: "var(--text-tertiary)" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
        </motion.button>

        <motion.div animate={waveAnim} className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center" style={{ backgroundColor: "var(--brand)" }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
        </motion.div>

        {[{ id: "api" as const, label: "A" }, { id: "tasks" as const, label: "T" }, { id: "notes" as const, label: "N" }, { id: "chat" as const, label: "C" }].map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); onToggleCollapse() }}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-bold transition-colors"
            style={{ backgroundColor: tab === t.id ? "var(--brand)" : "transparent", color: tab === t.id ? "#FFFFFF" : "var(--text-tertiary)" }}>
            {t.label}
          </button>
        ))}
      </motion.div>
    )
  }

  // Expanded mode
  return (
    <motion.div layout className="h-full flex flex-col overflow-hidden rounded-2xl border"
      style={{ backgroundColor: "var(--sidebar-background)", borderColor: "var(--border-default)" }}>
      
      <div className="flex items-center justify-between px-3 py-3 shrink-0 border-b" style={{ borderColor: "var(--border-default)" }}>
        <div className="flex items-center gap-2.5">
          <motion.div animate={waveAnim} className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center" style={{ backgroundColor: "var(--brand)" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
          </motion.div>
          <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>Inspector</span>
          <ConnectionSignal />
          {responseTime !== null && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "rgba(var(--brand-rgb),0.1)", color: "var(--brand)" }}>
              {responseTime}ms
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-1 px-3 py-2 border-b shrink-0" style={{ borderColor: "var(--border-default)" }}>
        {[{ id: "api" as const, label: "API" }, { id: "tasks" as const, label: "Tasks" }, { id: "notes" as const, label: "Notes" }, { id: "chat" as const, label: "Chat" }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex-1 py-1.5 text-[11px] font-semibold transition-all rounded-xl"
            style={{ backgroundColor: tab === t.id ? "var(--brand)" : "transparent", color: tab === t.id ? "#FFFFFF" : "var(--text-tertiary)" }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "api" && (
        <>
          <div className="flex gap-1 px-3 py-2 border-b flex-wrap shrink-0" style={{ borderColor: "var(--border-default)" }}>
            {QUICK_ACTIONS.map(qa => (
              <button key={qa.path} onClick={() => execute(qa.path)}
                className="text-[10px] px-2.5 py-1.5 font-semibold rounded-xl transition-all hover:opacity-80"
                style={{ backgroundColor: "var(--toolbar-surface)", color: "var(--toolbar-text)" }}>
                {qa.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-2" style={{ backgroundColor: "var(--toolbar-surface)" }}>
            {history.length === 0 && (
              <div className="p-3 rounded-xl text-xs" style={{ backgroundColor: "var(--toolbar-surface)", border: "1px solid var(--border-default)" }}>
                <p style={{ color: "var(--text-tertiary)" }}>Try a quick action or type an API path</p>
              </div>
            )}
            <AnimatePresence>
              {history.map((h, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ backgroundColor: "var(--toolbar-surface)" }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--brand)" }} />
                    <span style={{ color: "var(--text-primary)" }} className="text-xs">{h.cmd}</span>
                    <span className="ml-auto text-[10px] font-mono" style={{ color: h.time < 100 ? "var(--brand)" : "#F59E0B" }}>{h.time}ms</span>
                  </div>
                  <div className={`px-3 py-2 rounded-xl whitespace-pre-wrap text-xs ${h.error ? "border" : ""}`}
                    style={{ backgroundColor: "var(--toolbar-surface)", borderColor: h.error ? "rgba(220,38,38,0.2)" : "transparent", color: h.error ? "var(--brand)" : "var(--text-secondary)" }}>
                    {h.result.length > 800 ? h.result.slice(0, 800) + "..." : h.result}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>

          <div className="flex gap-1.5 p-3 border-t shrink-0" style={{ borderColor: "var(--border-default)" }}>
            <div className="flex-1 flex items-center gap-1.5 px-3 py-2 rounded-xl" style={{ backgroundColor: "var(--toolbar-surface)", border: "1px solid var(--border-default)" }}>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && execute()}
                placeholder="/api/health" className="flex-1 bg-transparent outline-none text-xs font-mono" style={{ color: "var(--text-primary)" }} />
            </div>
            <motion.button onClick={() => execute()} whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white" style={{ backgroundColor: "var(--brand)" }}>
              Send
            </motion.button>
          </div>
        </>
      )}

      {tab === "tasks" && (
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {tasks.length === 0 && <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>No tasks yet.</p>}
            {tasks.map(t => (
              <motion.div key={t.id} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 px-2 py-1.5 rounded-xl" style={{ borderBottom: "1px solid var(--border-default)" }}>
                <input type="checkbox" checked={t.done} onChange={() => toggleTask(t.id)} className="w-3.5 h-3.5 rounded-full accent-[var(--brand)] shrink-0" />
                <span className={`flex-1 text-xs ${t.done ? "line-through" : ""}`} style={{ color: t.done ? "var(--text-tertiary)" : "var(--text-primary)" }}>{t.text}</span>
                <button onClick={() => deleteTask(t.id)} className="text-[10px] opacity-40 hover:opacity-100 rounded-full w-4 h-4 flex items-center justify-center" style={{ color: "var(--brand)" }}>✕</button>
              </motion.div>
            ))}
          </div>
          <div className="flex gap-1.5 p-3 border-t shrink-0" style={{ borderColor: "var(--border-default)" }}>
            <input value={taskInput} onChange={e => setTaskInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addTask()}
              placeholder="Add task..." className="flex-1 px-2.5 py-1.5 text-xs outline-none rounded-xl" style={{ backgroundColor: "var(--toolbar-surface)", border: "1px solid var(--border-default)" }} />
            <button onClick={addTask} className="px-3 py-1.5 rounded-xl text-xs font-bold text-white" style={{ backgroundColor: "var(--brand)" }}>+</button>
          </div>
        </div>
      )}

      {tab === "chat" && <ChatTab />}

      {tab === "notes" && (
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {notes.length === 0 && <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>No notes yet.</p>}
            {notes.map(n => (
              <motion.div key={n.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="p-2.5 rounded-xl text-xs" style={{ backgroundColor: "var(--toolbar-surface)", border: "1px solid rgba(220,38,38,0.12)" }}>
                <div className="flex justify-between items-start gap-2">
                  <p style={{ color: "var(--text-primary)" }}>{n.text}</p>
                  <button onClick={() => deleteNote(n.id)} className="text-[10px] shrink-0 opacity-40 hover:opacity-100 rounded-full w-4 h-4 flex items-center justify-center" style={{ color: "var(--brand)" }}>✕</button>
                </div>
                <p className="text-[9px] mt-1.5 opacity-50" style={{ color: "var(--text-tertiary)" }}>{n.date}</p>
              </motion.div>
            ))}
          </div>
          <div className="flex gap-1.5 p-3 border-t shrink-0" style={{ borderColor: "var(--border-default)" }}>
            <input value={noteInput} onChange={e => setNoteInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addNote()}
              placeholder="Add note..." className="flex-1 px-2.5 py-1.5 text-xs outline-none rounded-xl" style={{ backgroundColor: "var(--toolbar-surface)", border: "1px solid var(--border-default)" }} />
            <button onClick={addNote} className="px-3 py-1.5 rounded-xl text-xs font-bold text-white" style={{ backgroundColor: "var(--brand)" }}>+</button>
          </div>
        </div>
      )}

      {/* Collapse button */}
      <motion.button onClick={onToggleCollapse} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        className="flex items-center justify-center py-2.5 shrink-0 mx-1.5 mb-1.5 rounded-xl"
        style={{ borderTop: "1px solid var(--border-default)", color: "var(--text-tertiary)" }}>
        <motion.svg animate={{ rotate: 180 }} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></motion.svg>
      </motion.button>
    </motion.div>
  )
}
