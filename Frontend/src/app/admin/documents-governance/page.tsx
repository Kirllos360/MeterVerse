"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

const waveAnim = { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 2.5, ease: "easeInOut" } }

interface DocRow { id: string; title: string; status: string; updatedAt: string; category?: { name?: string } }

export default function DocumentGovernancePage() {
  const [docs, setDocs] = useState<DocRow[]>([])
  const [live, setLive] = useState(false)
  const [title, setTitle] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])

  const fetchAll = () => {
    fetch("/api/documents-governance", { headers: { "X-Dev-Mode": "true" } })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.documents?.length !== undefined) { setDocs(d.documents.map((x: any) => ({ id: x.id, title: x.title, status: x.status, updatedAt: x.updatedAt, category: x.category }))); setLive(true) } })
      .catch(() => {})
    fetch("/api/documents-governance/meta/categories", { headers: { "X-Dev-Mode": "true" } })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.categories) setCategories(d.categories) })
      .catch(() => {})
  }
  useEffect(() => { fetchAll() }, [])

  const create = async () => {
    if (!title.trim()) return
    await fetch("/api/documents-governance", { method: "POST", headers: { "Content-Type": "application/json", "X-Dev-Mode": "true" }, body: JSON.stringify({ title, categoryId: categoryId || undefined }) }).catch(() => {})
    setTitle("")
    fetchAll()
  }

  const lifecycle = async (id: string, status: string) => {
    await fetch(`/api/documents-governance/${id}/approve`, { method: "POST", headers: { "Content-Type": "application/json", "X-Dev-Mode": "true" }, body: JSON.stringify({ status }) }).catch(() => {})
    fetchAll()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Document Governance</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{live ? `Live data from /api/documents-governance (${docs.length} docs)` : "Enterprise document records, versioning, lifecycle"}</p>
        </div>
        <motion.div animate={waveAnim} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--brand)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        </motion.div>
      </div>

      <div className="rounded-2xl border p-4 flex gap-2 items-end" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
        <div className="flex-1">
          <label className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="New document title" className="w-full px-3 py-2 mt-1 rounded-xl border text-sm" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-default)", color: "var(--text-primary)" }} />
        </div>
        <div>
          <label className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>Category</label>
          <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="px-3 py-2 mt-1 rounded-xl border text-sm" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}>
            <option value="">None</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <button onClick={create} className="px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: "var(--brand)" }}>Create</button>
      </div>

      <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ color: "var(--text-secondary)" }}>
              <th className="text-left px-4 py-2 font-semibold">Title</th>
              <th className="text-left px-4 py-2 font-semibold">Category</th>
              <th className="text-left px-4 py-2 font-semibold">Status</th>
              <th className="text-left px-4 py-2 font-semibold">Updated</th>
              <th className="text-left px-4 py-2 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {docs.map(d => (
              <tr key={d.id} style={{ borderTop: "1px solid var(--border-default)" }}>
                <td className="px-4 py-2" style={{ color: "var(--text-primary)" }}>{d.title}</td>
                <td className="px-4 py-2" style={{ color: "var(--text-secondary)" }}>{d.category?.name || "-"}</td>
                <td className="px-4 py-2"><span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: "rgba(var(--brand-rgb),0.12)", color: "var(--brand)" }}>{d.status}</span></td>
                <td className="px-4 py-2" style={{ color: "var(--text-secondary)" }}>{d.updatedAt?.slice(0, 10) || "-"}</td>
                <td className="px-4 py-2">
                  <div className="flex gap-2">
                    {d.status === "DRAFT" && <button onClick={() => lifecycle(d.id, "PUBLISHED")} className="text-xs font-semibold" style={{ color: "var(--brand)" }}>Publish</button>}
                    {d.status === "PUBLISHED" && <button onClick={() => lifecycle(d.id, "ARCHIVED")} className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>Archive</button>}
                  </div>
                </td>
              </tr>
            ))}
            {docs.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center" style={{ color: "var(--text-secondary)" }}>{live ? "No documents yet" : "Loading..."}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
