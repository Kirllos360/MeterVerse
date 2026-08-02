"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

const waveAnim = { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 2.5, ease: "easeInOut" } }

interface Ticket { id: string; subject: string; category: string; priority: string; status: string; createdAt: string }
interface ServiceRequest { id: string; type: string; subject: string; status: string; createdAt: string }

export default function UserSelfServicePage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [live, setLive] = useState(false)
  const [subject, setSubject] = useState("")
  const [type, setType] = useState("SUPPORT")
  const [customerId, setCustomerId] = useState("")

  // C14: find the viewer's customer context and load their tickets/requests.
  useEffect(() => {
    let cancelled = false
    fetch("/api/customers?limit=1", { headers: { "X-Dev-Mode": "true" } })
      .then(r => r.ok ? r.json() : null)
      .then(async d => {
        if (cancelled || !d?.customers?.length) return
        const cid = d.customers[0].id
        setCustomerId(cid)
        const t = await fetch(`/api/portal/customers/${cid}/tickets`, { headers: { "X-Dev-Mode": "true" } }).then(r => r.ok ? r.json() : null)
        const r = await fetch(`/api/portal/customers/${cid}/requests`, { headers: { "X-Dev-Mode": "true" } }).then(r => r.ok ? r.json() : null)
        if (cancelled) return
        if (t?.tickets?.length !== undefined) { setTickets(t.tickets); setLive(true) }
        if (r?.requests?.length !== undefined) { setRequests(r.requests); setLive(true) }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  const createTicket = async () => {
    if (!subject.trim() || !customerId) return
    await fetch(`/api/portal/customers/${customerId}/tickets`, { method: "POST", headers: { "Content-Type": "application/json", "X-Dev-Mode": "true" }, body: JSON.stringify({ subject, category: type, priority: "NORMAL" }) }).catch(() => {})
    setSubject("")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Self-Service</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{live ? "Live from /api/portal" : "Submit tickets and service requests"}</p>
        </div>
        <motion.div animate={waveAnim} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--brand)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M18 9v3m0 4v.01M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
        </motion.div>
      </div>

      <div className="rounded-2xl border p-4 flex gap-2 items-end" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
        <select value={type} onChange={e => setType(e.target.value)} className="px-3 py-2 rounded-xl border text-sm" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}>
          <option value="SUPPORT">Support</option>
          <option value="BILLING">Billing</option>
          <option value="METER">Meter</option>
          <option value="TECHNICAL">Technical</option>
          <option value="COMPLAINT">Complaint</option>
        </select>
        <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Describe your issue" className="flex-1 px-3 py-2 rounded-xl border text-sm" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-default)", color: "var(--text-primary)" }} />
        <button onClick={createTicket} className="px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: "var(--brand)" }}>Submit</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
          <div className="px-4 py-2 border-b text-sm font-bold" style={{ color: "var(--text-primary)", borderColor: "var(--border-default)" }}>My Tickets</div>
          <div className="divide-y" style={{ borderColor: "var(--border-default)" }}>
            {tickets.map(t => (
              <div key={t.id} className="px-4 py-3 flex justify-between items-center">
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{t.subject}</p>
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{t.category} · {t.priority}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: "rgba(var(--brand-rgb),0.12)", color: "var(--brand)" }}>{t.status}</span>
              </div>
            ))}
            {tickets.length === 0 && <div className="px-4 py-8 text-center text-sm" style={{ color: "var(--text-secondary)" }}>{live ? "No tickets" : "Loading..."}</div>}
          </div>
        </div>

        <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
          <div className="px-4 py-2 border-b text-sm font-bold" style={{ color: "var(--text-primary)", borderColor: "var(--border-default)" }}>Service Requests</div>
          <div className="divide-y" style={{ borderColor: "var(--border-default)" }}>
            {requests.map(r => (
              <div key={r.id} className="px-4 py-3 flex justify-between items-center">
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{r.subject}</p>
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{r.type}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: "rgba(var(--brand-rgb),0.12)", color: "var(--brand)" }}>{r.status}</span>
              </div>
            ))}
            {requests.length === 0 && <div className="px-4 py-8 text-center text-sm" style={{ color: "var(--text-secondary)" }}>{live ? "No requests" : "Loading..."}</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
