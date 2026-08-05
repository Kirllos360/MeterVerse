"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

const TABS = [
  { id: "profiles", label: "Connection Profiles" },
  { id: "runtime", label: "Runtime" },
  { id: "health", label: "Health" },
  { id: "diagnostics", label: "Diagnostics" },
  { id: "failover", label: "Failover" },
  { id: "observability", label: "Observability" },
]

const EMPTY_PROFILE = { name: "", host: "", port: 9000, tlsEnabled: true, dbType: "postgresql", dbHost: "", dbPort: 5432, dbName: "", dbUser: "", password: "", areaId: "" }

const AUTH = { Authorization: "Bearer dev", "X-Dev-Mode": "true" }

export default function ConnectivityCenterPage() {
  const [tab, setTab] = useState("profiles")
  const [profiles, setProfiles] = useState<any[]>([])
  const [runtime, setRuntime] = useState<any>(null)
  const [scores, setScores] = useState<any>(null)
  const [events, setEvents] = useState<any[]>([])
  const [metrics, setMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Popup state
  const [popup, setPopup] = useState<string | null>(null)
  const [form, setForm] = useState<any>({ ...EMPTY_PROFILE })
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null)
  const [diagRunning, setDiagRunning] = useState(false)

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [p, r, s, e, m] = await Promise.all([
        fetch("/api/connection-profiles", { headers: AUTH }).then(r => r.json()).catch(() => ({ profiles: [] })),
        fetch("/api/runtime/status", { headers: AUTH }).then(r => r.json()).catch(() => null),
        fetch("/api/health/scores", { headers: AUTH }).then(r => r.json()).catch(() => null),
        fetch("/api/observability/events", { headers: AUTH }).then(r => r.json()).catch(() => []),
        fetch("/api/observability/metrics", { headers: AUTH }).then(r => r.json()).catch(() => null),
      ])
      setProfiles(p.profiles || [])
      setRuntime(r)
      setScores(s)
      setEvents(Array.isArray(e) ? e.slice(0, 20) : e.events?.slice(0, 20) || [])
      setMetrics(m)
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { fetchAll() }, [])

  const handleAction = async (action: string, profileId?: string) => {
    const id = profileId || selectedId
    if (!id) return
    if (action === "activate") await fetch(`/api/connection-profiles/${id}/activate`, { method: "POST", headers: AUTH })
    if (action === "suspend") await fetch(`/api/connection-profiles/${id}/suspend`, { method: "POST", headers: AUTH })
    if (action === "archive") await fetch(`/api/connection-profiles/${id}`, { method: "DELETE", headers: AUTH })
    if (action === "restart") await fetch("/api/runtime/restart", { method: "POST", headers: AUTH })
    await fetchAll()
    setPopup(null)
  }

  const handleCreate = async () => {
    await fetch("/api/connection-profiles", { method: "POST", headers: { ...AUTH, "Content-Type": "application/json" }, body: JSON.stringify(form) })
    setPopup(null); setForm({ ...EMPTY_PROFILE }); await fetchAll()
  }

  const openForm = (profile?: any) => {
    if (profile) { setForm(profile); setSelectedId(profile.id); setPopup("edit") }
    else { setForm({ ...EMPTY_PROFILE }); setSelectedId(null); setPopup("create") }
  }

  const openDiagnostic = async (profileId: string) => {
    setSelectedId(profileId); setDiagnosticResult(null); setPopup("diagnostics"); setDiagRunning(true)
    const res = await fetch(`/api/diagnostics/${profileId}`, { method: "POST", headers: AUTH }).catch(() => null)
    const data = res ? await res.json() : null
    setDiagnosticResult(data); setDiagRunning(false)
  }

  const runFailover = async (profileId: string) => {
    const res = await fetch(`/api/failover/${profileId}`, { method: "POST", headers: AUTH }).catch(() => null)
    await fetchAll()
  }

  const statusColor = (s?: string) => s === "active" || s === "healthy" ? "#DC2626" : s === "degraded" ? "#f59e0b" : s === "failed" || s === "critical" ? "#ef4444" : "#6b7280"
  const scoreColor = (s?: number) => s && s >= 80 ? "#DC2626" : s && s >= 50 ? "#f59e0b" : s && s >= 25 ? "#f97316" : "#ef4444"

  const iSx = { backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)", color: "var(--text-primary)" } as React.CSSProperties

  const Modal = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <AnimatePresence>{popup && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40" onClick={() => setPopup(null)}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg rounded-2xl border shadow-xl max-h-[85vh] overflow-y-auto" style={{ backgroundColor: "var(--surface-raised)", borderColor: "var(--border-default)" }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border-default)" }}>
          <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{title}</h3>
          <button onClick={() => setPopup(null)} className="p-1 rounded-lg hover:bg-black/5"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg></button>
        </div>
        <div className="p-5">{children}</div>
      </motion.div>
    </motion.div>}</AnimatePresence>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Connectivity Center</h1><p className="text-xs" style={{ color: "var(--text-secondary)" }}>Enterprise connection management and monitoring</p></div>
        <button onClick={fetchAll} className="text-xs px-3 py-1.5 rounded-xl border transition-all hover:opacity-80" style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}>Refresh</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto py-1 scrollbar-none rounded-2xl border px-3" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="shrink-0 px-3 py-1.5 text-xs font-semibold transition-all rounded-xl whitespace-nowrap"
            style={{ backgroundColor: tab === t.id ? "var(--brand)" : "transparent", color: tab === t.id ? "#FFFFFF" : "var(--text-secondary)" }}>
            {tab === t.id && <span className="w-1.5 h-1.5 rounded-full bg-white inline-block mr-1.5" />}{t.label}
          </button>
        ))}
      </div>

      {/* ───────────────────── PROFILES TAB ───────────────────── */}
      {tab === "profiles" && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
        <button onClick={() => openForm()} className="rounded-xl px-3 py-1.5 text-xs font-semibold text-white" style={{ backgroundColor: "var(--brand)" }}>+ New Profile</button>
        {profiles.length === 0 ? <div className="rounded-2xl border p-8 text-center" style={{ borderColor: "var(--border-default)" }}><p className="text-sm" style={{ color: "var(--text-secondary)" }}>No connection profiles configured</p></div> :
        profiles.map((p: any) => (
          <div key={p.id} className="rounded-xl border px-4 py-3 flex items-center justify-between" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: statusColor(p.status) }} />
              <div><p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{p.name}</p><p className="text-[10px]" style={{ color: "var(--text-secondary)" }}>{p.host}:{p.port} · {p.status}</p></div>
            </div>
            <div className="flex items-center gap-1">
              <MiniBtn label="Test" onClick={() => { setSelectedId(p.id); openDiagnostic(p.id) }} />
              <MiniBtn label="Edit" onClick={() => openForm(p)} />
              {p.status === "active" ? <MiniBtn label="Suspend" onClick={() => handleAction("suspend", p.id)} /> : <MiniBtn label="Activate" onClick={() => handleAction("activate", p.id)} />}
              <MiniBtn label="Archive" onClick={() => handleAction("archive", p.id)} style={{ color: "#ef4444" }} />
              <MiniBtn label="Failover" onClick={() => runFailover(p.id)} />
            </div>
          </div>
        ))}
      </motion.div>}

      {/* ───────────────────── RUNTIME TAB ───────────────────── */}
      {tab === "runtime" && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border p-4" style={{ backgroundColor: "var(--surface-raised)", borderColor: "var(--border-default)" }}>
          <h3 className="text-xs font-bold mb-3" style={{ color: "var(--text-primary)" }}>Runtime Status</h3>
          {runtime ? <>
            <StatRow label="State" value={runtime.state} color={statusColor(runtime.state)} />
            <StatRow label="Active Connections" value={String(runtime.activeConnections || 0)} />
            <StatRow label="Pool Size" value={String(runtime.pool?.total || 0)} />
            <StatRow label="Sessions" value={String(runtime.sessions?.active || 0)} />
            <StatRow label="Uptime" value={Math.round(runtime.uptime || 0) + "s"} />
          </> : <p className="text-xs" style={{ color: "var(--text-secondary)" }}>No runtime data</p>}
        </div>
        <div className="rounded-xl border p-4" style={{ backgroundColor: "var(--surface-raised)", borderColor: "var(--border-default)" }}>
          <h3 className="text-xs font-bold mb-3" style={{ color: "var(--text-primary)" }}>Actions</h3>
          <button onClick={() => handleAction("restart")} className="rounded-xl px-4 py-2 text-xs font-semibold text-white" style={{ backgroundColor: "var(--brand)" }}>Restart Runtime</button>
          <p className="text-[10px] mt-2" style={{ color: "var(--text-tertiary)" }}>Restarting will temporarily disconnect all active connections</p>
        </div>
      </motion.div>}

      {/* ───────────────────── HEALTH TAB ───────────────────── */}
      {tab === "health" && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        {scores?.scores?.length > 0 ? scores.scores.map((s: any) => (
          <div key={s.profileId} className="rounded-xl border p-4" style={{ backgroundColor: "var(--surface-raised)", borderColor: "var(--border-default)" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: scoreColor(s.score) }} />
                <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{s.name}</span>
              </div>
              <span className="text-lg font-bold" style={{ color: scoreColor(s.score) }}>{s.score}</span>
            </div>
            {s.factors && <div className="grid grid-cols-5 gap-2 text-[10px]">
              {["connectivity","latency","freshness","syncHealth","runtimeStability"].map(k => (
                <div key={k} className="text-center"><div className="w-full h-1.5 rounded-full mt-1" style={{ backgroundColor: "var(--border-default)" }}>
                  <div className="h-full rounded-full" style={{ backgroundColor: "var(--brand)", width: (s.factors[k] || 0) + "%" }} /></div>
                  <span style={{ color: "var(--text-tertiary)" }}>{k.replace(/([A-Z])/g, ' $1')}</span>
                </div>
              ))}
            </div>}
          </div>
        )) : <p className="text-xs py-6 text-center" style={{ color: "var(--text-secondary)" }}>No health data yet</p>}
        {scores?.stats && <div className="rounded-xl border p-3 text-xs" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
          <span style={{ color: "var(--text-secondary)" }}>Average: {scores.stats.averageScore} · Healthy: {scores.stats.byStatus?.healthy || 0} · Degraded: {scores.stats.byStatus?.degraded || 0} · Critical: {scores.stats.byStatus?.critical || 0}</span>
        </div>}
      </motion.div>}

      {/* ───────────────────── DIAGNOSTICS TAB ───────────────────── */}
      {tab === "diagnostics" && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
        <div className="rounded-xl border p-4" style={{ backgroundColor: "var(--surface-raised)", borderColor: "var(--border-default)" }}>
          <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Select Profile & Run Diagnostic</p>
          <div className="flex items-center gap-2">
            <select onChange={e => setSelectedId(e.target.value)} value={selectedId || ""} className="flex-1 rounded-xl border px-3 py-2 text-xs outline-none" style={iSx}>
              <option value="">Select profile...</option>
              {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <button onClick={() => selectedId && openDiagnostic(selectedId)} disabled={!selectedId || diagRunning}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-white disabled:opacity-40" style={{ backgroundColor: "var(--brand)" }}>
              {diagRunning ? "Running..." : "Run Diagnostic"}
            </button>
          </div>
        </div>
        {diagnosticResult && (
          <div className="rounded-xl border p-4" style={{ backgroundColor: "var(--surface-raised)", borderColor: "var(--border-default)" }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>Results: {diagnosticResult.profileName}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: statusColor(diagnosticResult.overallStatus) + "20", color: statusColor(diagnosticResult.overallStatus) }}>
                {diagnosticResult.overallStatus}
              </span>
            </div>
            {diagnosticResult.stages?.map((s: any) => (
              <div key={s.stage} className="flex items-center gap-3 py-2 border-b text-xs" style={{ borderColor: "var(--border-default)" }}>
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
                  style={{ backgroundColor: s.status === "passed" ? "rgba(220,38,38,0.15)" : s.status === "failed" ? "rgba(239,68,68,0.15)" : "rgba(156,163,175,0.15)", color: s.status === "passed" ? "#DC2626" : s.status === "failed" ? "#ef4444" : "#9ca3af" }}>
                  {s.status === "passed" ? "✓" : s.status === "failed" ? "✗" : "—"}
                </span>
                <span className="flex-1" style={{ color: "var(--text-primary)" }}>Stage {s.stage}: {s.name}</span>
                <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{s.latencyMs}ms</span>
              </div>
            ))}
            {diagnosticResult.recommendations?.length > 0 && <div className="mt-3 p-3 rounded-xl" style={{ backgroundColor: "rgba(245,158,11,0.08)" }}>
              <p className="text-xs font-semibold mb-1" style={{ color: "#f59e0b" }}>Recommendations</p>
              {diagnosticResult.recommendations.map((r: string, i: number) => (
                <p key={i} className="text-[10px] mb-0.5" style={{ color: "var(--text-secondary)" }}>• {r}</p>
              ))}
            </div>}
          </div>
        )}
      </motion.div>}

      {/* ───────────────────── FAILOVER TAB ───────────────────── */}
      {tab === "failover" && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
        <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>Connection Failover Operations</p>
        {profiles.map(p => (
          <div key={p.id} className="rounded-xl border px-4 py-3 flex items-center justify-between" style={{ backgroundColor: "var(--surface-topbar)", borderColor: "var(--border-default)" }}>
            <div>
              <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{p.name}</p>
              <p className="text-[10px]" style={{ color: "var(--text-secondary)" }}>{p.host}:{p.port} · Backups: {(p.backups?.length || 0)}</p>
            </div>
            <div className="flex items-center gap-1">
              <MiniBtn label="Failover" onClick={() => runFailover(p.id)} />
              <MiniBtn label="Switchback" onClick={async () => { await fetch(`/api/failover/${p.id}/switchback`, { method: "POST", headers: AUTH }); await fetchAll() }} />
            </div>
          </div>
        ))}
      </motion.div>}

      {/* ───────────────────── OBSERVABILITY TAB ───────────────────── */}
      {tab === "observability" && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metrics && <div className="rounded-xl border p-4" style={{ backgroundColor: "var(--surface-raised)", borderColor: "var(--border-default)" }}>
          <h3 className="text-xs font-bold mb-3" style={{ color: "var(--text-primary)" }}>Metrics Snapshot</h3>
          <StatRow label="Active Connections" value={String(metrics.runtime?.activeConnections || 0)} />
          <StatRow label="Avg Health Score" value={String(metrics.health?.averageScore || 0)} />
          <StatRow label="Jobs Executed" value={String(metrics.counters?.["scheduler.executed"] || 0)} />
          <StatRow label="Failovers" value={String(metrics.failover?.total || 0)} />
        </div>}
        <div className="rounded-xl border p-4" style={{ backgroundColor: "var(--surface-raised)", borderColor: "var(--border-default)" }}>
          <h3 className="text-xs font-bold mb-3" style={{ color: "var(--text-primary)" }}>Recent Events</h3>
          {events.length === 0 ? <p className="text-xs" style={{ color: "var(--text-secondary)" }}>No events yet</p> :
            events.slice(0, 10).map((e: any, i: number) => (
              <div key={i} className="flex items-center gap-2 py-1.5 text-[10px] border-b" style={{ borderColor: "var(--border-default)" }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--brand)" }} />
                <span style={{ color: "var(--text-primary)" }}>{e.event || e.action}</span>
                <span style={{ color: "var(--text-tertiary)" }}>{new Date(e.timestamp || e.createdAt).toLocaleTimeString()}</span>
              </div>
            ))
          }
        </div>
      </motion.div>}

      {/* ─── MODALS ─── */}
      <Modal title={popup === "edit" ? "Edit Profile" : "New Profile"}>
        <div className="grid grid-cols-2 gap-3">
          {[{k:"name",l:"Name",h:"e.g. October Primary"},{k:"host",l:"Host",h:"e.g. 10.0.1.50"},{k:"port",l:"Port",h:"e.g. 9000"},{k:"dbHost",l:"DB Host",h:"Database server host"},{k:"dbPort",l:"DB Port",h:"e.g. 5432"},{k:"dbName",l:"DB Name",h:"Database name"},{k:"dbUser",l:"DB User",h:"Database username"},{k:"password",l:"Password",type:"password",h:"Connection password"},{k:"areaId",l:"Area ID",h:"e.g. October"}].map(f => (
            <div key={f.k} className={f.k === "name" ? "col-span-2" : ""}>
              <label className="text-[10px] font-semibold block mb-0.5" style={{ color: "var(--text-secondary)" }}>{f.l}</label>
              <input type={f.type || "text"} value={form[f.k] || ""} onChange={e => setForm({...form, [f.k]: e.target.value})}
                placeholder={f.h} className="w-full rounded-xl border px-3 py-2 text-xs outline-none" style={iSx} />
              <p className="text-[9px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>{f.h}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 mt-4 pt-3 border-t" style={{ borderColor: "var(--border-default)" }}>
          <button onClick={handleCreate} className="rounded-xl px-4 py-2 text-xs font-semibold text-white" style={{ backgroundColor: "var(--brand)" }}>{popup === "edit" ? "Update" : "Create"}</button>
          <button onClick={() => setPopup(null)} className="text-xs" style={{ color: "var(--text-secondary)" }}>Cancel</button>
        </div>
      </Modal>

      {/* Diagnostics Result Modal */}
      <Modal title="Diagnostic Report">
        {diagRunning ? <div className="flex items-center justify-center py-8"><div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--brand)", borderTopColor: "transparent" }} /></div> : diagnosticResult ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between"><span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>Status</span><span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: statusColor(diagnosticResult.overallStatus)+"20", color: statusColor(diagnosticResult.overallStatus) }}>{diagnosticResult.overallStatus}</span></div>
            <div className="text-xs" style={{ color: "var(--text-secondary)" }}>Duration: {diagnosticResult.durationMs}ms · Stages: {diagnosticResult.summary?.passed}/{diagnosticResult.summary?.total} passed</div>
          </div>
        ) : <p className="text-xs" style={{ color: "var(--text-secondary)" }}>No diagnostic data</p>}
      </Modal>
    </div>
  )
}

function StatRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return <div className="flex items-center justify-between py-1.5 border-b text-xs" style={{ borderColor: "var(--border-default)" }}>
    <span style={{ color: "var(--text-secondary)" }}>{label}</span>
    <span className="font-semibold" style={{ color: color || "var(--text-primary)" }}>{value}</span>
  </div>
}

function MiniBtn({ label, onClick, style }: { label: string; onClick?: () => void; style?: any }) {
  return <button onClick={onClick} className="px-2 py-1 text-[9px] font-semibold rounded-md transition-all hover:opacity-80" style={{ color: style?.color || "var(--text-tertiary)" }}>{label}</button>
}
