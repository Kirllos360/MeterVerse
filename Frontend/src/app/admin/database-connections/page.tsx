"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

const DB_TYPES = [
  { value: "postgresql", label: "PostgreSQL" },
  { value: "mysql", label: "MySQL" },
  { value: "mssql", label: "SQL Server" },
  { value: "oracle", label: "Oracle" },
]

const EMPTY_FORM = { name: "", type: "postgresql", host: "", port: 5432, database: "", username: "", password: "", areaId: "" }

export default function DatabaseConnectionsPage() {
  const [connections, setConnections] = useState<any[]>([])
  const [form, setForm] = useState<any>({ ...EMPTY_FORM })
  const [editing, setEditing] = useState<string | null>(null)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchConnections = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/database-connections", { headers: { Authorization: "Bearer dev", "X-Dev-Mode": "true" } })
      const d = await res.json()
      setConnections(d.connections || [])
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { fetchConnections() }, [])

  const handleTest = async () => {
    setTesting(true)
    setTestResult(null)
    try {
      const res = await fetch("/api/database-connections/test", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer dev", "X-Dev-Mode": "true" },
        body: JSON.stringify(form),
      })
      setTestResult(await res.json())
    } catch { setTestResult({ success: false, error: "Request failed" }) }
    setTesting(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch("/api/database-connections", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer dev", "X-Dev-Mode": "true" },
        body: JSON.stringify(form),
      })
      setForm({ ...EMPTY_FORM })
      setEditing(null)
      await fetchConnections()
    } catch {} finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/database-connections/${id}`, { method: "DELETE", headers: { Authorization: "Bearer dev", "X-Dev-Mode": "true" } })
    await fetchConnections()
  }

  const handleEdit = (conn: any) => {
    setForm({ name: conn.name, type: conn.type, host: conn.host, port: conn.port, database: conn.database, username: conn.username, password: "", areaId: conn.areaId || "" })
    setEditing(conn.id)
  }

  const updateField = (field: string, value: any) => setForm((prev: any) => ({ ...prev, [field]: value }))

  const inputClass = "w-full rounded-xl border px-3 py-2 text-xs outline-none transition-all focus:border-[var(--brand)]"
  const inputStyle = { backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)", color: "var(--text-primary)" } as React.CSSProperties

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Database Connections</h1><p className="text-sm" style={{ color: "var(--text-secondary)" }}>Configure and manage per-area database connections</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
          className="rounded-2xl border p-5 space-y-4" style={{ backgroundColor: "var(--surface-raised)", borderColor: "var(--border-default)" }}>
          <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{editing ? "Edit Connection" : "New Connection"}</h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>Connection Name</label>
              <input value={form.name} onChange={e => updateField("name", e.target.value)} placeholder="e.g. October Main DB" className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>Type</label>
              <select value={form.type} onChange={e => updateField("type", e.target.value)} className={inputClass} style={inputStyle}>
                {DB_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>Area (optional)</label>
              <input value={form.areaId} onChange={e => updateField("areaId", e.target.value)} placeholder="Area name" className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>Host</label>
              <input value={form.host} onChange={e => updateField("host", e.target.value)} placeholder="10.0.1.50" className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>Port</label>
              <input type="number" value={form.port} onChange={e => updateField("port", parseInt(e.target.value) || 5432)} className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>Database</label>
              <input value={form.database} onChange={e => updateField("database", e.target.value)} placeholder="meter_db" className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>Username</label>
              <input value={form.username} onChange={e => updateField("username", e.target.value)} placeholder="db_user" className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>Password</label>
              <input type="password" value={form.password} onChange={e => updateField("password", e.target.value)} placeholder="••••••••" className={inputClass} style={inputStyle} />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button onClick={handleTest} disabled={testing}
              className="rounded-xl px-4 py-2 text-xs font-semibold border transition-all hover:opacity-80 disabled:opacity-40"
              style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}>
              {testing ? "Testing..." : "Test Connection"}
            </button>
            <button onClick={handleSave} disabled={saving || !form.name || !form.host}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: "var(--brand)" }}>
              {saving ? "Saving..." : editing ? "Update" : "Save Connection"}
            </button>
            {editing && <button onClick={() => { setForm({ ...EMPTY_FORM }); setEditing(null) }}
              className="text-xs" style={{ color: "var(--text-secondary)" }}>Cancel</button>}
          </div>

          {testResult && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border p-3 text-xs" style={{ backgroundColor: testResult.success ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)", borderColor: testResult.success ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)" }}>
              <p style={{ color: testResult.success ? "#22c55e" : "#ef4444", fontWeight: 600 }}>
                {testResult.success ? "Connected successfully" : "Connection failed"}
              </p>
              {testResult.latency && <p style={{ color: "var(--text-secondary)" }}>Latency: {testResult.latency}ms</p>}
              {testResult.error && <p style={{ color: "var(--text-secondary)" }}>{testResult.error}</p>}
            </motion.div>
          )}
        </motion.div>

        {/* Saved connections list */}
        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
          className="rounded-2xl border p-5" style={{ backgroundColor: "var(--surface-raised)", borderColor: "var(--border-default)" }}>
          <h3 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>Saved Connections</h3>
          {loading ? <div className="flex items-center justify-center py-8"><div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--brand)", borderTopColor: "transparent" }} /></div> : connections.length === 0 ? (
            <p className="text-xs py-6 text-center" style={{ color: "var(--text-secondary)" }}>No database connections configured yet</p>
          ) : (
            <div className="space-y-2">
              {connections.map((conn: any) => (
                <div key={conn.id} className="rounded-xl border p-3 flex items-center justify-between" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{conn.name}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: "var(--text-secondary)" }}>{conn.type.toUpperCase()} · {conn.host}:{conn.port}/{conn.database}</p>
                    {conn.areaId && <p className="text-[10px]" style={{ color: "var(--brand)" }}>Area: {conn.areaId}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleEdit(conn)} className="text-[10px] font-semibold px-2 py-1 rounded-lg border" style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}>Edit</button>
                    <button onClick={() => handleDelete(conn.id)} className="text-[10px] font-semibold px-2 py-1 rounded-lg" style={{ color: "#ef4444" }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
