"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

const waveAnim = { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 2.5, ease: "easeInOut" } }

interface Conv { id: string; subject?: string; type: string; status: string; updatedAt: string; messages: { body?: string }[] }

export default function CommunicationInboxPage() {
  const [convs, setConvs] = useState<Conv[]>([])
  const [live, setLive] = useState(false)
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")

  const fetchAll = () => {
    fetch("/api/communication/conversations", { headers: { "X-Dev-Mode": "true" } })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.conversations?.length !== undefined) { setConvs(d.conversations); setLive(true) } })
      .catch(() => {})
  }
  useEffect(() => { fetchAll() }, [])

  const create = async () => {
    if (!body.trim()) return
    await fetch("/api/communication/conversations", { method: "POST", headers: { "Content-Type": "application/json", "X-Dev-Mode": "true" }, body: JSON.stringify({ subject: subject || undefined, type: "INTERNAL", body }) }).catch(() => {})
    setSubject(""); setBody(""); fetchAll()
  }

  const close = async (id: string) => {
    await fetch(`/api/communication/conversations/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json", "X-Dev-Mode": "true" }, body: JSON.stringify({ status: "CLOSED" }) }).catch(() => {})
    fetchAll()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Communication Inbox</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{live ? `Live from /api/communication (${convs.length} conversations)` : "Unified inbox — internal, customer, workflow"}</p>
        </div>
        <motion.div animate={waveAnim} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--brand)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M8 10h8m-8 4h5M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" /></svg>
        </motion.div>
      </div>

      <div className="rounded-2xl border p-4 space-y-2" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
        <div className="flex gap-2">
          <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject (optional)" className="flex-1 px-3 py-2 rounded-xl border text-sm" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-default)", color: "var(--text-primary)" }} />
          <input value={body} onChange={e => setBody(e.target.value)} placeholder="Message" className="flex-1 px-3 py-2 rounded-xl border text-sm" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-default)", color: "var(--text-primary)" }} />
          <button onClick={create} className="px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: "var(--brand)" }}>Start</button>
        </div>
      </div>

      <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ color: "var(--text-secondary)" }}>
              <th className="text-left px-4 py-2 font-semibold">Subject</th>
              <th className="text-left px-4 py-2 font-semibold">Type</th>
              <th className="text-left px-4 py-2 font-semibold">Status</th>
              <th className="text-left px-4 py-2 font-semibold">Last message</th>
              <th className="text-left px-4 py-2 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {convs.map(c => (
              <tr key={c.id} style={{ borderTop: "1px solid var(--border-default)" }}>
                <td className="px-4 py-2" style={{ color: "var(--text-primary)" }}>{c.subject || "(no subject)"}</td>
                <td className="px-4 py-2" style={{ color: "var(--text-secondary)" }}>{c.type}</td>
                <td className="px-4 py-2"><span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: "rgba(var(--brand-rgb),0.12)", color: "var(--brand)" }}>{c.status}</span></td>
                <td className="px-4 py-2" style={{ color: "var(--text-secondary)" }}>{c.messages?.[0]?.body || "-"}</td>
                <td className="px-4 py-2">
                  {c.status !== "CLOSED" && <button onClick={() => close(c.id)} className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>Close</button>}
                </td>
              </tr>
            ))}
            {convs.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center" style={{ color: "var(--text-secondary)" }}>{live ? "No conversations yet" : "Loading..."}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
