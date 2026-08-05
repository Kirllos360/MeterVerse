"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChatTab } from "@/features/chat/ChatTab"

const STORAGE_KEY_TASKS = "mv-inspector-tasks"
const STORAGE_KEY_NOTES = "mv-inspector-notes"
const STORAGE_KEY_LIST = "mv-inspector-list"
const STORAGE_KEY_REMINDERS = "mv-inspector-reminders"

const waveAnim = { scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7], transition: { repeat: Infinity, duration: 2.5, ease: "easeInOut" } }

const iconWave = {
  scale: [1, 1.15, 1],
  transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
}

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
        className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: status === "online" ? "#DC2626" : status === "degraded" ? "#F59E0B" : "#EF4444" }} />
      <span className="text-[9px] font-semibold capitalize" style={{ color: "var(--text-tertiary)" }}>{status}</span>
    </div>
  )
}

const TABS = [
  { id: "tasks" as const, label: "Tasks", shortLabel: "T" },
  { id: "notes" as const, label: "Notes", shortLabel: "N" },
  { id: "chat" as const, label: "Chat", shortLabel: "C" },
  { id: "list" as const, label: "List", shortLabel: "L" },
  { id: "reminders" as const, label: "Remind", shortLabel: "R" },
]

type TabId = (typeof TABS)[number]["id"]

function CollapseIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <motion.svg animate={{ rotate: collapsed ? 180 : 0 }} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="15 18 9 12 15 6" />
    </motion.svg>
  )
}

export function InspectorPanel({ collapsed, onToggleCollapse }: { collapsed: boolean; onToggleCollapse: () => void }) {
  const [tab, setTab] = useState<TabId>("tasks")

  const [tasks, setTasks] = useState<{id: number; text: string; done: boolean}[]>([])
  const [taskInput, setTaskInput] = useState("")
  useEffect(() => { try { const s = localStorage.getItem(STORAGE_KEY_TASKS); if (s) setTasks(JSON.parse(s)) } catch {} }, [])
  useEffect(() => { localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks)) }, [tasks])

  const [notes, setNotes] = useState<{id: number; text: string; date: string}[]>([])
  const [noteInput, setNoteInput] = useState("")
  useEffect(() => { try { const s = localStorage.getItem(STORAGE_KEY_NOTES); if (s) setNotes(JSON.parse(s)) } catch {} }, [])
  useEffect(() => { localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(notes)) }, [notes])

  const [listItems, setListItems] = useState<{id: number; text: string; done: boolean}[]>([])
  const [listInput, setListInput] = useState("")
  useEffect(() => { try { const s = localStorage.getItem(STORAGE_KEY_LIST); if (s) setListItems(JSON.parse(s)) } catch {} }, [])
  useEffect(() => { localStorage.setItem(STORAGE_KEY_LIST, JSON.stringify(listItems)) }, [listItems])

  const [reminders, setReminders] = useState<{id: number; text: string; date: string}[]>([])
  const [reminderInput, setReminderInput] = useState("")
  useEffect(() => { try { const s = localStorage.getItem(STORAGE_KEY_REMINDERS); if (s) setReminders(JSON.parse(s)) } catch {} }, [])
  useEffect(() => { localStorage.setItem(STORAGE_KEY_REMINDERS, JSON.stringify(reminders)) }, [reminders])

  const addTask = () => { if (!taskInput.trim()) return; setTasks(t => [...t, { id: Date.now(), text: taskInput.trim(), done: false }]); setTaskInput("") }
  const toggleTask = (id: number) => setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t))
  const deleteTask = (id: number) => setTasks(tasks.filter(t => t.id !== id))

  const addNote = () => { if (!noteInput.trim()) return; setNotes(n => [{ id: Date.now(), text: noteInput.trim(), date: new Date().toLocaleDateString() }, ...n]); setNoteInput("") }
  const deleteNote = (id: number) => setNotes(notes.filter(n => n.id !== id))

  const addListItem = () => { if (!listInput.trim()) return; setListItems(l => [...l, { id: Date.now(), text: listInput.trim(), done: false }]); setListInput("") }
  const toggleListItem = (id: number) => setListItems(listItems.map(i => i.id === id ? { ...i, done: !i.done } : i))
  const deleteListItem = (id: number) => setListItems(listItems.filter(i => i.id !== id))

  const addReminder = () => { if (!reminderInput.trim()) return; setReminders(r => [{ id: Date.now(), text: reminderInput.trim(), date: new Date().toLocaleDateString() }, ...r]); setReminderInput("") }
  const deleteReminder = (id: number) => setReminders(reminders.filter(r => r.id !== id))

  if (collapsed) {
    return (
      <motion.div layout className="h-full flex flex-col items-center overflow-hidden rounded-2xl border py-3"
        style={{ backgroundColor: "var(--sidebar-background)", borderColor: "var(--border-default)", width: 52 }}>

        <motion.div animate={waveAnim} className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center mb-3" style={{ backgroundColor: "var(--brand)" }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
        </motion.div>

        <div className="flex-1 flex flex-col items-center gap-3">
          {TABS.map(t => (
            <motion.button key={t.id} onClick={() => { setTab(t.id); onToggleCollapse() }}
              whileHover={iconWave}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-bold transition-colors"
              style={{ backgroundColor: tab === t.id ? "var(--brand)" : "transparent", color: tab === t.id ? "#FFFFFF" : "var(--text-tertiary)" }}>
              {t.shortLabel}
            </motion.button>
          ))}
        </div>

        <motion.button onClick={onToggleCollapse} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          className="flex items-center justify-center py-2.5 shrink-0 w-full mt-3"
          style={{ borderTop: "1px solid var(--border-default)", color: "var(--text-tertiary)" }}>
          <CollapseIcon collapsed={collapsed} />
        </motion.button>
      </motion.div>
    )
  }

  return (
    <motion.div layout className="h-full flex flex-col overflow-hidden rounded-2xl border"
      style={{ backgroundColor: "var(--sidebar-background)", borderColor: "var(--border-default)" }}>

      <div className="flex items-center justify-between px-3 py-3 shrink-0 border-b" style={{ borderColor: "var(--border-default)" }}>
        <div className="flex items-center gap-2.5">
          <motion.div animate={waveAnim} className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center" style={{ backgroundColor: "var(--brand)" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
          </motion.div>
          <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>Shortcut Menu</span>
          <ConnectionSignal />
        </div>
      </div>

      <div className="flex gap-1 px-3 py-2 border-b shrink-0" style={{ borderColor: "var(--border-default)" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex-1 py-1.5 text-[11px] font-semibold transition-all rounded-xl"
            style={{ backgroundColor: tab === t.id ? "var(--brand)" : "transparent", color: tab === t.id ? "#FFFFFF" : "var(--text-tertiary)" }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "tasks" && (
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {tasks.length === 0 && <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>No tasks yet.</p>}
            <AnimatePresence>
              {tasks.map(t => (
                <motion.div key={t.id} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 5 }}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-xl" style={{ borderBottom: "1px solid var(--border-default)" }}>
                  <input type="checkbox" checked={t.done} onChange={() => toggleTask(t.id)} className="w-3.5 h-3.5 rounded-full accent-[var(--brand)] shrink-0" />
                  <span className={`flex-1 text-xs ${t.done ? "line-through" : ""}`} style={{ color: t.done ? "var(--text-tertiary)" : "var(--text-primary)" }}>{t.text}</span>
                  <button onClick={() => deleteTask(t.id)} className="text-[10px] opacity-40 hover:opacity-100 rounded-full w-4 h-4 flex items-center justify-center" style={{ color: "var(--brand)" }}>✕</button>
                </motion.div>
              ))}
            </AnimatePresence>
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
            <AnimatePresence>
              {notes.map(n => (
                <motion.div key={n.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="p-2.5 rounded-xl text-xs" style={{ backgroundColor: "var(--toolbar-surface)", border: "1px solid rgba(220,38,38,0.12)" }}>
                  <div className="flex justify-between items-start gap-2">
                    <p style={{ color: "var(--text-primary)" }}>{n.text}</p>
                    <button onClick={() => deleteNote(n.id)} className="text-[10px] shrink-0 opacity-40 hover:opacity-100 rounded-full w-4 h-4 flex items-center justify-center" style={{ color: "var(--brand)" }}>✕</button>
                  </div>
                  <p className="text-[9px] mt-1.5 opacity-50" style={{ color: "var(--text-tertiary)" }}>{n.date}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div className="flex gap-1.5 p-3 border-t shrink-0" style={{ borderColor: "var(--border-default)" }}>
            <input value={noteInput} onChange={e => setNoteInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addNote()}
              placeholder="Add note..." className="flex-1 px-2.5 py-1.5 text-xs outline-none rounded-xl" style={{ backgroundColor: "var(--toolbar-surface)", border: "1px solid var(--border-default)" }} />
            <button onClick={addNote} className="px-3 py-1.5 rounded-xl text-xs font-bold text-white" style={{ backgroundColor: "var(--brand)" }}>+</button>
          </div>
        </div>
      )}

      {tab === "list" && (
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {listItems.length === 0 && <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>No list items yet.</p>}
            <AnimatePresence>
              {listItems.map(i => (
                <motion.div key={i.id} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 5 }}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-xl" style={{ borderBottom: "1px solid var(--border-default)" }}>
                  <input type="checkbox" checked={i.done} onChange={() => toggleListItem(i.id)} className="w-3.5 h-3.5 rounded-full accent-[var(--brand)] shrink-0" />
                  <span className={`flex-1 text-xs ${i.done ? "line-through" : ""}`} style={{ color: i.done ? "var(--text-tertiary)" : "var(--text-primary)" }}>{i.text}</span>
                  <button onClick={() => deleteListItem(i.id)} className="text-[10px] opacity-40 hover:opacity-100 rounded-full w-4 h-4 flex items-center justify-center" style={{ color: "var(--brand)" }}>✕</button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div className="flex gap-1.5 p-3 border-t shrink-0" style={{ borderColor: "var(--border-default)" }}>
            <input value={listInput} onChange={e => setListInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addListItem()}
              placeholder="Add list item..." className="flex-1 px-2.5 py-1.5 text-xs outline-none rounded-xl" style={{ backgroundColor: "var(--toolbar-surface)", border: "1px solid var(--border-default)" }} />
            <button onClick={addListItem} className="px-3 py-1.5 rounded-xl text-xs font-bold text-white" style={{ backgroundColor: "var(--brand)" }}>+</button>
          </div>
        </div>
      )}

      {tab === "reminders" && (
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {reminders.length === 0 && <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>No reminders yet.</p>}
            <AnimatePresence>
              {reminders.map(r => (
                <motion.div key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="p-2.5 rounded-xl text-xs" style={{ backgroundColor: "var(--toolbar-surface)", border: "1px solid rgba(234,179,8,0.15)" }}>
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p style={{ color: "var(--text-primary)" }}>{r.text}</p>
                      <p className="text-[9px] mt-1 opacity-60" style={{ color: "var(--text-tertiary)" }}>{r.date}</p>
                    </div>
                    <button onClick={() => deleteReminder(r.id)} className="text-[10px] shrink-0 opacity-40 hover:opacity-100 rounded-full w-4 h-4 flex items-center justify-center" style={{ color: "var(--brand)" }}>✕</button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div className="flex gap-1.5 p-3 border-t shrink-0" style={{ borderColor: "var(--border-default)" }}>
            <input value={reminderInput} onChange={e => setReminderInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addReminder()}
              placeholder="Add reminder..." className="flex-1 px-2.5 py-1.5 text-xs outline-none rounded-xl" style={{ backgroundColor: "var(--toolbar-surface)", border: "1px solid var(--border-default)" }} />
            <button onClick={addReminder} className="px-3 py-1.5 rounded-xl text-xs font-bold text-white" style={{ backgroundColor: "var(--brand)" }}>+</button>
          </div>
        </div>
      )}

      <motion.button onClick={onToggleCollapse} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        className="flex items-center justify-center py-2.5 shrink-0 mx-1.5 mb-1.5 rounded-xl"
        style={{ borderTop: "1px solid var(--border-default)", color: "var(--text-tertiary)" }}>
        <CollapseIcon collapsed={collapsed} />
      </motion.button>
    </motion.div>
  )
}
