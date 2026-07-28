"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

const TABS = [
  { id: "config", label: "Configuration" },
  { id: "status", label: "Connection Status" },
  { id: "vms", label: "VM Settings" },
]

const DB_TYPES = [
  { value: "postgresql", label: "PostgreSQL" },
  { value: "mssql", label: "SQL Server" },
  { value: "mysql", label: "MySQL" },
  { value: "oracle", label: "Oracle" },
]

const EMPTY_FORM = { name: "", type: "postgresql", host: "", port: 5432, database: "", username: "", password: "", areaId: "", projectId: "" }

export default function ConnectionSettingsPage() {
  const [tab, setTab] = useState("config")
  const [connections, setConnections] = useState<any[]>([])
  const [selectedConn, setSelectedConn] = useState<any | null>(null)
  const [activePopup, setActivePopup] = useState<string | null>(null)
  const [form, setForm] = useState<any>({ ...EMPTY_FORM })
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)
  const [syncProgress, setSyncProgress] = useState(0)
  const [syncing, setSyncing] = useState(false)
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

  const openPopup = (type: string, conn?: any) => {
    setActivePopup(type)
    setTestResult(null)
    if (conn) { setSelectedConn(conn); setForm({ ...EMPTY_FORM, name: conn.name, type: conn.type, host: conn.host, port: conn.port, database: conn.database, username: conn.username, areaId: conn.areaId || "", projectId: conn.projectId || "" }) }
    else { setSelectedConn(null); setForm({ ...EMPTY_FORM }) }
  }

  const closePopup = () => { setActivePopup(null); setSelectedConn(null); setTestResult(null) }

  // Group connections by area
  const grouped: Record<string, any[]> = connections.reduce((acc: any, conn: any) => {
    const area = conn.areaId || "Unassigned"
    if (!acc[area]) acc[area] = []
    acc[area].push(conn)
    return acc
  }, {} as Record<string, any[]>)

  const inputStyle = { backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)", color: "var(--text-primary)" } as React.CSSProperties
  const inputClass = "w-full rounded-xl border px-3 py-2 text-xs outline-none transition-all focus:border-[var(--brand)]"

  const statusColor = (s?: string) => s === "active" || s === "Online" ? "#22c55e" : s === "degraded" || s === "Degraded" ? "#f59e0b" : "#6b7280"

  const PopupWrapper = ({ children, title }: { children: React.ReactNode; title: string }) => (
    <AnimatePresence>
      {activePopup && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40" onClick={closePopup}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-lg rounded-2xl border shadow-xl max-h-[85vh] overflow-y-auto" style={{ backgroundColor: "var(--surface-raised)", borderColor: "var(--border-default)" }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border-default)" }}>
              <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{title}</h3>
              <button onClick={closePopup} className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg></button>
            </div>
            <div className="p-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Connection Settings</h1><p className="text-xs" style={{ color: "var(--text-secondary)" }}>Manage database connections per area and project</p></div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto py-1 scrollbar-none rounded-2xl border px-3" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
        {TABS.map((t, i) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="shrink-0 px-3 py-1.5 text-xs font-semibold transition-all rounded-xl whitespace-nowrap"
            style={{ backgroundColor: tab === t.id ? "var(--brand)" : "transparent", color: tab === t.id ? "#FFFFFF" : "var(--text-secondary)" }}>
            {tab === t.id && <span className="w-1.5 h-1.5 rounded-full bg-white inline-block mr-1.5" />}
            {t.label}
          </button>
        ))}
      </div>

      {tab !== "config" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border p-5 text-center" style={{ borderColor: "var(--border-default)" }}>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{tab === "status" ? "Connection status monitoring" : "VM management settings"} — coming soon</p>
        </motion.div>
      )}

      {tab === "config" && (loading ? <div className="flex items-center justify-center py-12"><div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" /></div> : Object.keys(grouped).length === 0 ? (
        <div className="rounded-2xl border p-8 text-center" style={{ borderColor: "var(--border-default)" }}>
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>No connections configured</p>
          <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>Click "Add" to create your first database connection</p>
          <button onClick={() => openPopup("add")} className="mt-4 rounded-xl px-4 py-2 text-xs font-semibold text-white" style={{ backgroundColor: "var(--brand)" }}>+ Add Connection</button>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([area, conns]) => (
            <motion.div key={area} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border overflow-hidden" style={{ borderColor: "var(--border-default)" }}>
              {/* Area header */}
              <div className="flex items-center justify-between px-5 py-3 border-b" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: conns.some(c => c.status !== "offline") ? "#22c55e" : "#ef4444" }} />
                  <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{area}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>{conns.length} connection{conns.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ActionBtn label="Add" onClick={() => openPopup("add")} />
                  <ActionBtn label="Test All" onClick={() => openPopup("test-all")} />
                </div>
              </div>
              {/* Connection rows */}
              {conns.map((conn: any) => (
                <div key={conn.id} className="px-5 py-3 border-b last:border-b-0 flex items-center justify-between" style={{ borderColor: "var(--border-default)" }}>
                  <div className="flex items-center gap-4">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColor(conn.status) }} />
                    <div>
                      <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{conn.name}</p>
                      <p className="text-[10px]" style={{ color: "var(--text-secondary)" }}>{conn.type?.toUpperCase()} — {conn.host}:{conn.port}/{conn.database}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <MiniBtn label="Test" onClick={() => { setSelectedConn(conn); setForm({ ...EMPTY_FORM, name: conn.name, type: conn.type, host: conn.host, port: conn.port, database: conn.database, username: conn.username, areaId: conn.areaId || "" }); setActivePopup("test") }} />
                    <MiniBtn label="View" onClick={() => openPopup("view", conn)} />
                    <MiniBtn label="Edit" onClick={() => openPopup("edit", conn)} />
                    <MiniBtn label="Del" onClick={async () => { await fetch(`/api/database-connections/${conn.id}`, { method: "DELETE", headers: { Authorization: "Bearer dev", "X-Dev-Mode": "true" } }); fetchConnections() }} style={{ color: "#ef4444" }} />
                    <MiniBtn label={conn.active !== false ? "Deact" : "Activate"} />
                  </div>
                </div>
              ))}
            </motion.div>
          ))}
        </div>
      ))}

      {/* ─── ADD / EDIT POPUP ─── */}
      <PopupWrapper title={activePopup === "edit" ? "Edit Connection" : "New Connection"}>
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: "name", label: "Connection Name", type: "text", hint: "e.g. October Main DB" },
            { key: "host", label: "Host", type: "text", hint: "e.g. 10.0.1.50 or db.example.com" },
            { key: "port", label: "Port", type: "number", hint: "e.g. 5432 (PostgreSQL), 1433 (SQL Server)" },
            { key: "database", label: "Database Name", type: "text", hint: "e.g. PalmHills_October" },
            { key: "username", label: "Username", type: "text", hint: "e.g. meter_user" },
            { key: "password", label: "Password", type: "password", hint: "Minimum 8 characters" },
          ].map(f => (
            <div key={f.key} className={f.key === "name" ? "col-span-2" : ""}>
              <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>{f.label}</label>
              <input type={f.type} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: f.type === "number" ? parseInt(e.target.value) || 0 : e.target.value })}
                placeholder={f.hint} className={inputClass} style={inputStyle} />
              <p className="text-[9px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>{f.hint}</p>
            </div>
          ))}
          <div>
            <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>Type</label>
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className={inputClass} style={inputStyle}>
              {DB_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>Area</label>
            <input value={form.areaId} onChange={e => setForm({ ...form, areaId: e.target.value })} placeholder="e.g. October" className={inputClass} style={inputStyle} />
          </div>
        </div>
        <div className="flex items-center gap-3 mt-5 pt-4 border-t" style={{ borderColor: "var(--border-default)" }}>
          <button onClick={async () => {
            setSaving(true)
            await fetch("/api/database-connections", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer dev", "X-Dev-Mode": "true" }, body: JSON.stringify(form) })
            setSaving(false); closePopup(); fetchConnections()
          }} disabled={saving} className="rounded-xl px-4 py-2 text-xs font-semibold text-white disabled:opacity-50" style={{ backgroundColor: "var(--brand)" }}>
            {saving ? "Saving..." : activePopup === "edit" ? "Update Connection" : "Save Connection"}
          </button>
          <button onClick={closePopup} className="text-xs px-4 py-2" style={{ color: "var(--text-secondary)" }}>Cancel</button>
        </div>
      </PopupWrapper>

      {/* ─── TEST POPUP ─── */}
      <PopupWrapper title="Test Connection">
        <div className="space-y-5">
          <div className="rounded-xl border p-4" style={{ borderColor: "var(--border-default)" }}>
            <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Connection Details</p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{form.name} — {form.type?.toUpperCase()} | {form.host}:{form.port}/{form.database}</p>
          </div>
          {testResult && (
            <div className="rounded-xl border p-3 text-xs" style={{ backgroundColor: testResult.success ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)", borderColor: testResult.success ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)" }}>
              <p style={{ color: testResult.success ? "#22c55e" : "#ef4444", fontWeight: 600 }}>{testResult.success ? "Connected" : "Failed"}</p>
              <p style={{ color: "var(--text-secondary)" }}>Latency: {testResult.latency}ms</p>
              {testResult.error && <p style={{ color: "var(--text-secondary)" }}>{testResult.error}</p>}
            </div>
          )}
          <button onClick={async () => {
            setTesting(true)
            const res = await fetch("/api/database-connections/test", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer dev", "X-Dev-Mode": "true" }, body: JSON.stringify(form) })
            setTestResult(await res.json()); setTesting(false)
          }} disabled={testing} className="w-full rounded-xl py-2 text-xs font-semibold text-white disabled:opacity-50" style={{ backgroundColor: "var(--brand)" }}>
            {testing ? "Testing..." : "Test Connection"}
          </button>

          <div className="border-t pt-4" style={{ borderColor: "var(--border-default)" }}>
            <h4 className="text-xs font-semibold mb-3" style={{ color: "var(--text-primary)" }}>Sync Tests</h4>
            {/* Sync Meter Test */}
            <div className="rounded-xl border p-3 mb-3" style={{ borderColor: "var(--border-default)" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>Sync Meter Test</span>
                <button onClick={async () => {
                  setSyncing(true); setSyncProgress(0)
                  for (let i = 0; i <= 100; i += 10) { await new Promise(r => setTimeout(r, 200)); setSyncProgress(i) }
                  setSyncing(false)
                }} disabled={syncing} className="rounded-lg px-3 py-1 text-[10px] font-semibold text-white disabled:opacity-40" style={{ backgroundColor: "var(--brand)" }}>
                  {syncing ? `${syncProgress}%` : "Run Test"}
                </button>
              </div>
              {syncing && (
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--border-default)" }}>
                  <motion.div className="h-full rounded-full" style={{ backgroundColor: "var(--brand)", width: `${syncProgress}%` }} />
                </div>
              )}
              <p className="text-[10px] mt-1" style={{ color: "var(--text-tertiary)" }}>Tests meter data synchronization with this connection</p>
            </div>
            {/* Sync Reading Test */}
            <div className="rounded-xl border p-3" style={{ borderColor: "var(--border-default)" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>Sync Reading Test</span>
                <button onClick={async () => {
                  setSyncing(true); setSyncProgress(0)
                  for (let i = 0; i <= 100; i += 10) { await new Promise(r => setTimeout(r, 300)); setSyncProgress(i) }
                  setSyncing(false)
                }} disabled={syncing} className="rounded-lg px-3 py-1 text-[10px] font-semibold text-white disabled:opacity-40" style={{ backgroundColor: "var(--brand)" }}>
                  {syncing ? `${syncProgress}%` : "Run Test"}
                </button>
              </div>
              {syncing && (
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--border-default)" }}>
                  <motion.div className="h-full rounded-full" style={{ backgroundColor: "var(--brand)", width: `${syncProgress}%` }} />
                </div>
              )}
              <p className="text-[10px] mt-1" style={{ color: "var(--text-tertiary)" }}>Tests reading data synchronization with this connection</p>
            </div>
          </div>
        </div>
      </PopupWrapper>

      {/* ─── VIEW POPUP ─── */}
      <PopupWrapper title="Connection Details">
        <div className="space-y-3">
          {[
            { label: "Name", value: selectedConn?.name },
            { label: "Type", value: selectedConn?.type?.toUpperCase() },
            { label: "Host", value: selectedConn?.host },
            { label: "Port", value: selectedConn?.port },
            { label: "Database", value: selectedConn?.database },
            { label: "Username", value: selectedConn?.username },
            { label: "Area", value: selectedConn?.areaId || "—" },
            { label: "Status", value: selectedConn?.active !== false ? "Active" : "Inactive" },
          ].map(f => (
            <div key={f.label} className="flex items-center justify-between rounded-xl border px-4 py-2.5" style={{ borderColor: "var(--border-default)" }}>
              <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{f.label}</span>
              <span className="text-xs font-semibold" style={{ color: f.value === "—" ? "var(--text-tertiary)" : "var(--text-primary)" }}>{f.value || "—"}</span>
            </div>
          ))}
          <button onClick={closePopup} className="w-full rounded-xl py-2 text-xs font-semibold text-white mt-2" style={{ backgroundColor: "var(--brand)" }}>Close</button>
        </div>
      </PopupWrapper>
    </div>
  )
}

function ActionBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return <button onClick={onClick} className="px-3 py-1.5 text-[10px] font-semibold rounded-lg border transition-all hover:opacity-80" style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}>{label}</button>
}

function MiniBtn({ label, onClick, style }: { label: string; onClick?: () => void; style?: any }) {
  return <button onClick={onClick} className="px-2 py-1 text-[9px] font-semibold rounded-md transition-all hover:opacity-80" style={{ color: style?.color || "var(--text-tertiary)", ...style }}>{label}</button>
}
